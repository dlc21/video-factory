#define WIN32_LEAN_AND_MEAN
#define CINTERFACE
#define COBJMACROS
#define INITGUID
#include <windows.h>
#include <mmsystem.h>
#include <objbase.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>
#include "vendor/speech.h"

typedef struct {
  unsigned long long timestamp;
  DWORD callbackTick;
  unsigned char ipa;
  unsigned char engine;
  DWORD hints;
  TTSMOUTH mouth;
} MouthCue;

typedef struct {
  unsigned long long timestamp;
  DWORD byteOffset;
} WordCue;

typedef struct {
  volatile LONG textDone;
  volatile LONG fileDone;
  volatile LONG audioStopped;
  unsigned long long audioStart;
  DWORD audioStartTick;
  unsigned long long audioStop;
  MouthCue *mouthCues;
  size_t mouthCount;
  size_t mouthCapacity;
  WordCue *wordCues;
  size_t wordCount;
  size_t wordCapacity;
} RenderContext;

typedef struct {
  ITTSNotifySink iface;
  RenderContext *ctx;
} NotifySink;

typedef struct {
  ITTSBufNotifySink iface;
  RenderContext *ctx;
} BufferSink;

typedef struct {
  IAudioFileNotifySink iface;
  RenderContext *ctx;
} FileSink;

static int iid_equal(REFIID left, const IID *right) {
  return IsEqualIID(left, right);
}

static HRESULT STDMETHODCALLTYPE notify_query(ITTSNotifySink *self, REFIID iid, void **out) {
  if (!out) return E_POINTER;
  *out = NULL;
  if (iid_equal(iid, &IID_IUnknown) || iid_equal(iid, &IID_ITTSNotifySink)) {
    *out = self;
    return S_OK;
  }
  return E_NOINTERFACE;
}
static ULONG STDMETHODCALLTYPE notify_addref(ITTSNotifySink *self) { (void)self; return 1; }
static ULONG STDMETHODCALLTYPE notify_release(ITTSNotifySink *self) { (void)self; return 1; }
static HRESULT STDMETHODCALLTYPE notify_attrib(ITTSNotifySink *self, DWORD id) { (void)self; (void)id; return S_OK; }
static HRESULT STDMETHODCALLTYPE notify_audio_start(ITTSNotifySink *self, QWORD timestamp) {
  NotifySink *sink = (NotifySink *)self;
  sink->ctx->audioStart = (unsigned long long)timestamp;
  sink->ctx->audioStartTick = GetTickCount();
  return S_OK;
}
static HRESULT STDMETHODCALLTYPE notify_audio_stop(ITTSNotifySink *self, QWORD timestamp) {
  NotifySink *sink = (NotifySink *)self;
  sink->ctx->audioStop = (unsigned long long)timestamp;
  InterlockedExchange(&sink->ctx->audioStopped, 1);
  return S_OK;
}
static HRESULT STDMETHODCALLTYPE notify_visual(ITTSNotifySink *self, QWORD timestamp, CHAR ipa, CHAR engine, DWORD hints, PTTSMOUTH mouth) {
  NotifySink *sink = (NotifySink *)self;
  RenderContext *ctx = sink->ctx;
  if (!mouth) return S_OK;
  if (ctx->mouthCount == ctx->mouthCapacity) {
    size_t nextCapacity = ctx->mouthCapacity ? ctx->mouthCapacity * 2 : 128;
    MouthCue *next = (MouthCue *)realloc(ctx->mouthCues, nextCapacity * sizeof(MouthCue));
    if (!next) return E_OUTOFMEMORY;
    ctx->mouthCues = next;
    ctx->mouthCapacity = nextCapacity;
  }
  MouthCue *cue = &ctx->mouthCues[ctx->mouthCount++];
  cue->timestamp = (unsigned long long)timestamp;
  cue->callbackTick = GetTickCount();
  cue->ipa = (unsigned char)ipa;
  cue->engine = (unsigned char)engine;
  cue->hints = hints;
  cue->mouth = *mouth;
  return S_OK;
}
static ITTSNotifySinkAVtbl notify_vtable = {
  notify_query, notify_addref, notify_release, notify_attrib,
  notify_audio_start, notify_audio_stop, notify_visual
};

static HRESULT STDMETHODCALLTYPE buffer_query(ITTSBufNotifySink *self, REFIID iid, void **out) {
  if (!out) return E_POINTER;
  *out = NULL;
  if (iid_equal(iid, &IID_IUnknown) || iid_equal(iid, &IID_ITTSBufNotifySink)) {
    *out = self;
    return S_OK;
  }
  return E_NOINTERFACE;
}
static ULONG STDMETHODCALLTYPE buffer_addref(ITTSBufNotifySink *self) { (void)self; return 1; }
static ULONG STDMETHODCALLTYPE buffer_release(ITTSBufNotifySink *self) { (void)self; return 1; }
static HRESULT STDMETHODCALLTYPE buffer_done(ITTSBufNotifySink *self, QWORD timestamp, DWORD flags) {
  BufferSink *sink = (BufferSink *)self;
  (void)timestamp; (void)flags;
  InterlockedExchange(&sink->ctx->textDone, 1);
  return S_OK;
}
static HRESULT STDMETHODCALLTYPE buffer_started(ITTSBufNotifySink *self, QWORD timestamp) { (void)self; (void)timestamp; return S_OK; }
static HRESULT STDMETHODCALLTYPE buffer_bookmark(ITTSBufNotifySink *self, QWORD timestamp, DWORD mark) { (void)self; (void)timestamp; (void)mark; return S_OK; }
static HRESULT STDMETHODCALLTYPE buffer_word(ITTSBufNotifySink *self, QWORD timestamp, DWORD byteOffset) {
  BufferSink *sink = (BufferSink *)self;
  RenderContext *ctx = sink->ctx;
  if (ctx->wordCount == ctx->wordCapacity) {
    size_t nextCapacity = ctx->wordCapacity ? ctx->wordCapacity * 2 : 64;
    WordCue *next = (WordCue *)realloc(ctx->wordCues, nextCapacity * sizeof(WordCue));
    if (!next) return E_OUTOFMEMORY;
    ctx->wordCues = next;
    ctx->wordCapacity = nextCapacity;
  }
  ctx->wordCues[ctx->wordCount].timestamp = (unsigned long long)timestamp;
  ctx->wordCues[ctx->wordCount].byteOffset = byteOffset;
  ctx->wordCount++;
  return S_OK;
}
static ITTSBufNotifySinkVtbl buffer_vtable = {
  buffer_query, buffer_addref, buffer_release,
  buffer_done, buffer_started, buffer_bookmark, buffer_word
};

static HRESULT STDMETHODCALLTYPE file_query(IAudioFileNotifySink *self, REFIID iid, void **out) {
  if (!out) return E_POINTER;
  *out = NULL;
  if (iid_equal(iid, &IID_IUnknown) || iid_equal(iid, &IID_IAudioFileNotifySink)) {
    *out = self;
    return S_OK;
  }
  return E_NOINTERFACE;
}
static ULONG STDMETHODCALLTYPE file_addref(IAudioFileNotifySink *self) { (void)self; return 1; }
static ULONG STDMETHODCALLTYPE file_release(IAudioFileNotifySink *self) { (void)self; return 1; }
static HRESULT STDMETHODCALLTYPE file_begin(IAudioFileNotifySink *self, DWORD id) { (void)self; (void)id; return S_OK; }
static HRESULT STDMETHODCALLTYPE file_end(IAudioFileNotifySink *self, DWORD id) {
  FileSink *sink = (FileSink *)self;
  (void)id;
  InterlockedExchange(&sink->ctx->fileDone, 1);
  return S_OK;
}
static HRESULT STDMETHODCALLTYPE file_empty(IAudioFileNotifySink *self) {
  FileSink *sink = (FileSink *)self;
  InterlockedExchange(&sink->ctx->fileDone, 1);
  return S_OK;
}
static HRESULT STDMETHODCALLTYPE file_posn(IAudioFileNotifySink *self, QWORD processed, QWORD left) { (void)self; (void)processed; (void)left; return S_OK; }
static IAudioFileNotifySinkVtbl file_vtable = {
  file_query, file_addref, file_release,
  file_begin, file_end, file_empty, file_posn
};

static void json_string(FILE *out, const char *text) {
  const unsigned char *p = (const unsigned char *)text;
  fputc('"', out);
  while (*p) {
    switch (*p) {
      case '"': fputs("\\\"", out); break;
      case '\\': fputs("\\\\", out); break;
      case '\b': fputs("\\b", out); break;
      case '\f': fputs("\\f", out); break;
      case '\n': fputs("\\n", out); break;
      case '\r': fputs("\\r", out); break;
      case '\t': fputs("\\t", out); break;
      default:
        if (*p < 0x20) fprintf(out, "\\u%04x", (unsigned int)*p);
        else fputc(*p, out);
    }
    p++;
  }
  fputc('"', out);
}

static char *read_file(const char *path) {
  FILE *file = fopen(path, "rb");
  long size;
  char *data;
  if (!file) return NULL;
  if (fseek(file, 0, SEEK_END) != 0 || (size = ftell(file)) < 0 || fseek(file, 0, SEEK_SET) != 0) {
    fclose(file); return NULL;
  }
  data = (char *)malloc((size_t)size + 1);
  if (!data) { fclose(file); return NULL; }
  if (fread(data, 1, (size_t)size, file) != (size_t)size) { free(data); fclose(file); return NULL; }
  data[size] = '\0';
  fclose(file);
  return data;
}

static int find_mode(PITTSENUM enumerator, const char *voice, TTSMODEINFO *selected) {
  PITTSENUM clone = NULL;
  TTSMODEINFO info;
  DWORD fetched = 0;
  HRESULT hr = enumerator->lpVtbl->Clone(enumerator, &clone);
  if (FAILED(hr)) return 0;
  while (SUCCEEDED(clone->lpVtbl->Next(clone, 1, &info, &fetched)) && fetched == 1) {
    if (strcmp(info.szModeName, voice) == 0) {
      *selected = info;
      clone->lpVtbl->Release(clone);
      return 1;
    }
  }
  clone->lpVtbl->Release(clone);
  return 0;
}

static int list_voices(void) {
  PITTSENUM enumerator = NULL;
  PITTSENUM clone = NULL;
  TTSMODEINFO info;
  DWORD fetched = 0;
  int first = 1;
  HRESULT hr = CoCreateInstance(&CLSID_TTSEnumerator, NULL, CLSCTX_ALL, &IID_ITTSEnum, (void **)&enumerator);
  if (FAILED(hr)) { fprintf(stderr, "SAPI4 enumerator unavailable: 0x%08lx\n", (unsigned long)hr); return 2; }
  hr = enumerator->lpVtbl->Clone(enumerator, &clone);
  if (FAILED(hr)) { enumerator->lpVtbl->Release(enumerator); return 2; }
  fputs("{\"schema\":\"retro-voice-engine.voices.v1\",\"voices\":[", stdout);
  while (SUCCEEDED(clone->lpVtbl->Next(clone, 1, &info, &fetched)) && fetched == 1) {
    if (!first) fputc(',', stdout);
    first = 0;
    fputs("{\"name\":", stdout); json_string(stdout, info.szModeName);
    fputs(",\"manufacturer\":", stdout); json_string(stdout, info.szMfgName);
    fputs(",\"product\":", stdout); json_string(stdout, info.szProductName);
    fputs(",\"speaker\":", stdout); json_string(stdout, info.szSpeaker);
    fprintf(stdout, ",\"gender\":%u,\"age\":%u,\"features\":%lu}",
      (unsigned int)info.wGender, (unsigned int)info.wAge, (unsigned long)info.dwFeatures);
  }
  fputs("]}\n", stdout);
  clone->lpVtbl->Release(clone);
  enumerator->lpVtbl->Release(enumerator);
  return 0;
}

static unsigned long wav_bytes_per_second(const char *path) {
  unsigned char bytes[4];
  FILE *wav = fopen(path, "rb");
  unsigned long value;
  if (!wav) return 0;
  if (fseek(wav, 28, SEEK_SET) != 0 || fread(bytes, 1, 4, wav) != 4) {
    fclose(wav);
    return 0;
  }
  fclose(wav);
  value = (unsigned long)bytes[0] |
    ((unsigned long)bytes[1] << 8) |
    ((unsigned long)bytes[2] << 16) |
    ((unsigned long)bytes[3] << 24);
  return value;
}

static double cue_milliseconds(unsigned long long timestamp, unsigned long long start, unsigned long bytesPerSecond) {
  if (timestamp < start || !bytesPerSecond) return 0.0;
  return (double)(timestamp - start) * 1000.0 / (double)bytesPerSecond;
}

static double callback_milliseconds(DWORD callbackTick, DWORD startTick) {
  return (double)(callbackTick - startTick);
}

static int write_cues(const char *path, const char *voice, const char *text, const RenderContext *ctx, unsigned long bytesPerSecond) {
  FILE *out = fopen(path, "wb");
  size_t i;
  if (!out) return 0;
  fputs("{\"schema\":\"retro-voice-engine.lipsync.v2\",\"timebase\":\"sapi4-audio-position-milliseconds\",\"voice\":", out);
  json_string(out, voice);
  fputs(",\"text\":", out); json_string(out, text);
  fprintf(out, ",\"audioBytesPerSecond\":%lu,\"durationMs\":%.3f,\"mouthCues\":[", bytesPerSecond, cue_milliseconds(ctx->audioStop, ctx->audioStart, bytesPerSecond));
  for (i = 0; i < ctx->mouthCount; i++) {
    const MouthCue *cue = &ctx->mouthCues[i];
    if (i) fputc(',', out);
    fprintf(out,
      "{\"timeMs\":%.3f,\"callbackArrivalTimeMs\":%.3f,\"rawTimestamp\":%I64u,\"ipa\":%u,\"enginePhoneme\":%u,\"hints\":%lu,"
      "\"mouth\":{\"height\":%u,\"width\":%u,\"upturn\":%u,\"jawOpen\":%u,"
      "\"upperTeethVisible\":%u,\"lowerTeethVisible\":%u,\"tonguePosition\":%u,\"lipTension\":%u}}",
      cue_milliseconds(cue->timestamp, ctx->audioStart, bytesPerSecond),
      callback_milliseconds(cue->callbackTick, ctx->audioStartTick), cue->timestamp,
      (unsigned int)cue->ipa, (unsigned int)cue->engine, (unsigned long)cue->hints,
      (unsigned int)cue->mouth.bMouthHeight, (unsigned int)cue->mouth.bMouthWidth,
      (unsigned int)cue->mouth.bMouthUpturn, (unsigned int)cue->mouth.bJawOpen,
      (unsigned int)cue->mouth.bTeethUpperVisible, (unsigned int)cue->mouth.bTeethLowerVisible,
      (unsigned int)cue->mouth.bTonguePosn, (unsigned int)cue->mouth.bLipTension);
  }
  fputs("],\"wordCues\":[", out);
  for (i = 0; i < ctx->wordCount; i++) {
    if (i) fputc(',', out);
    fprintf(out, "{\"timeMs\":%.3f,\"rawTimestamp\":%I64u,\"byteOffset\":%lu}",
      cue_milliseconds(ctx->wordCues[i].timestamp, ctx->audioStart, bytesPerSecond),
      ctx->wordCues[i].timestamp, (unsigned long)ctx->wordCues[i].byteOffset);
  }
  fputs("]}\n", out);
  fclose(out);
  return 1;
}

static int render(const char *voice, const char *textPath, const char *wavPath, const char *cuesPath, int pitch, unsigned long speed) {
  PITTSENUM enumerator = NULL;
  PITTSCENTRAL central = NULL;
  PITTSATTRIBUTES attributes = NULL;
  PIAUDIOFILE audio = NULL;
  TTSMODEINFO mode;
  RenderContext ctx;
  NotifySink notify;
  BufferSink buffer;
  FileSink fileSink;
  DWORD registration = 0;
  SDATA textData;
  char *text = NULL;
  wchar_t wideWav[MAX_PATH];
  HRESULT hr;
  DWORD startedAt;
  MSG message;
  int result = 2;

  ZeroMemory(&ctx, sizeof(ctx));
  unsigned long bytesPerSecond;
  notify.iface.lpVtbl = &notify_vtable; notify.ctx = &ctx;
  buffer.iface.lpVtbl = &buffer_vtable; buffer.ctx = &ctx;
  fileSink.iface.lpVtbl = &file_vtable; fileSink.ctx = &ctx;

  text = read_file(textPath);
  if (!text || !*text) { fprintf(stderr, "Input text is empty or unreadable\n"); goto cleanup; }
  if (!MultiByteToWideChar(CP_UTF8, 0, wavPath, -1, wideWav, MAX_PATH)) {
    if (!MultiByteToWideChar(CP_ACP, 0, wavPath, -1, wideWav, MAX_PATH)) {
      fprintf(stderr, "WAV path is invalid\n"); goto cleanup;
    }
  }

  hr = CoCreateInstance(&CLSID_TTSEnumerator, NULL, CLSCTX_ALL, &IID_ITTSEnum, (void **)&enumerator);
  if (FAILED(hr)) { fprintf(stderr, "SAPI4 enumerator unavailable: 0x%08lx\n", (unsigned long)hr); goto cleanup; }
  if (!find_mode(enumerator, voice, &mode)) { fprintf(stderr, "Voice not found: %s\n", voice); goto cleanup; }
  hr = CoCreateInstance(&CLSID_AudioDestFile, NULL, CLSCTX_ALL, &IID_IAudioFile, (void **)&audio);
  if (FAILED(hr)) { fprintf(stderr, "SAPI4 file destination unavailable: 0x%08lx\n", (unsigned long)hr); goto cleanup; }
  hr = audio->lpVtbl->Register(audio, &fileSink.iface);
  if (FAILED(hr)) { fprintf(stderr, "Could not register file sink: 0x%08lx\n", (unsigned long)hr); goto cleanup; }
  hr = audio->lpVtbl->Set(audio, wideWav, 1);
  if (FAILED(hr)) { fprintf(stderr, "Could not open WAV destination: 0x%08lx\n", (unsigned long)hr); goto cleanup; }
  audio->lpVtbl->RealTimeSet(audio, 0x100);

  hr = enumerator->lpVtbl->Select(enumerator, mode.gModeID, &central, (LPUNKNOWN)audio);
  if (FAILED(hr)) { fprintf(stderr, "Could not select voice: 0x%08lx\n", (unsigned long)hr); goto cleanup; }
  hr = central->lpVtbl->QueryInterface(central, &IID_ITTSAttributes, (void **)&attributes);
  if (SUCCEEDED(hr) && attributes) {
    if (pitch >= 0) attributes->lpVtbl->PitchSet(attributes, (WORD)pitch);
    if (speed > 0) attributes->lpVtbl->SpeedSet(attributes, speed);
  }
  hr = central->lpVtbl->Register(central, &notify.iface, IID_ITTSNotifySink, &registration);
  if (FAILED(hr)) { fprintf(stderr, "Could not register visual sink: 0x%08lx\n", (unsigned long)hr); goto cleanup; }

  textData.pData = text;
  textData.dwSize = (DWORD)strlen(text) + 1;
  hr = central->lpVtbl->TextData(central, CHARSET_TEXT, 0, textData, &buffer.iface, IID_ITTSBufNotifySink);
  if (FAILED(hr)) { fprintf(stderr, "Synthesis failed to start: 0x%08lx\n", (unsigned long)hr); goto cleanup; }

  startedAt = GetTickCount();
  while (!(ctx.textDone && (ctx.fileDone || ctx.audioStopped))) {
    while (PeekMessage(&message, NULL, 0, 0, PM_REMOVE)) {
      TranslateMessage(&message);
      DispatchMessage(&message);
    }
    if ((DWORD)(GetTickCount() - startedAt) > 120000) {
      fprintf(stderr, "Synthesis timed out\n"); goto cleanup;
    }
    Sleep(1);
  }
  audio->lpVtbl->Flush(audio);
  bytesPerSecond = wav_bytes_per_second(wavPath);
  if (!bytesPerSecond) { fprintf(stderr, "Could not read WAV timing metadata\n"); goto cleanup; }
  if (!write_cues(cuesPath, voice, text, &ctx, bytesPerSecond)) { fprintf(stderr, "Could not write cue data\n"); goto cleanup; }
  fprintf(stdout, "{\"wav\":"); json_string(stdout, wavPath);
  fputs(",\"cues\":", stdout); json_string(stdout, cuesPath);
  fprintf(stdout, ",\"mouthCueCount\":%lu,\"wordCueCount\":%lu}\n",
    (unsigned long)ctx.mouthCount, (unsigned long)ctx.wordCount);
  result = 0;

cleanup:
  if (central && registration) central->lpVtbl->UnRegister(central, registration);
  if (attributes) attributes->lpVtbl->Release(attributes);
  if (central) central->lpVtbl->Release(central);
  if (audio) audio->lpVtbl->Release(audio);
  if (enumerator) enumerator->lpVtbl->Release(enumerator);
  free(ctx.mouthCues);
  free(ctx.wordCues);
  free(text);
  return result;
}

static void usage(void) {
  fputs("retro-sapi4 --list\n"
        "retro-sapi4 --voice NAME --text-file INPUT.txt --wav OUTPUT.wav --cues OUTPUT.json [--pitch N] [--speed N]\n", stderr);
}

int main(int argc, char **argv) {
  const char *voice = NULL, *textPath = NULL, *wavPath = NULL, *cuesPath = NULL;
  int pitch = -1;
  unsigned long speed = 0;
  int i, result;
  HRESULT hr = CoInitialize(NULL);
  if (FAILED(hr)) { fprintf(stderr, "COM initialization failed: 0x%08lx\n", (unsigned long)hr); return 2; }
  if (argc == 2 && strcmp(argv[1], "--list") == 0) {
    result = list_voices();
    CoUninitialize();
    return result;
  }
  for (i = 1; i < argc; i++) {
    if (strcmp(argv[i], "--voice") == 0 && i + 1 < argc) voice = argv[++i];
    else if (strcmp(argv[i], "--text-file") == 0 && i + 1 < argc) textPath = argv[++i];
    else if (strcmp(argv[i], "--wav") == 0 && i + 1 < argc) wavPath = argv[++i];
    else if (strcmp(argv[i], "--cues") == 0 && i + 1 < argc) cuesPath = argv[++i];
    else if (strcmp(argv[i], "--pitch") == 0 && i + 1 < argc) pitch = atoi(argv[++i]);
    else if (strcmp(argv[i], "--speed") == 0 && i + 1 < argc) speed = strtoul(argv[++i], NULL, 10);
    else { usage(); CoUninitialize(); return 2; }
  }
  if (!voice || !textPath || !wavPath || !cuesPath || pitch > 65535) {
    usage(); CoUninitialize(); return 2;
  }
  result = render(voice, textPath, wavPath, cuesPath, pitch, speed);
  CoUninitialize();
  return result;
}
