/*
 * Mouth drawing logic ported without geometry changes from Microsoft's
 * 1995-1998 SAPI 4 TTSAPP sample (native/vendor/mttsappd.cpp).
 * Original notice: Copyright (c) 1995-1998 by Microsoft Corporation.
 * Provided "AS IS" without warranty of any kind.
 */
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
  BYTE bMouthHeight;
  BYTE bMouthWidth;
  BYTE bMouthUpturn;
  BYTE bJawOpen;
  BYTE bTeethUpperVisible;
  BYTE bTeethLowerVisible;
  BYTE bTonguePosn;
  BYTE bLipTension;
} TTSMOUTH, *PTTSMOUTH;

static int iCenterX, iCenterY, iMaxWidthX, iMinWidthX, iMaxHeightY;
static int iMaxTopLipHeight, iMaxBottomLipHeight, iMaxTopTeethHeight, iMaxBottomTeethHeight;
static BOOL gfMale;
static int iTopLipAboveTeeth, iBottomLipBelowTeeth, iMouthWidthX, iMouthHeightY;
static int iTopLipHeight, iBottomLipHeight, iMidLipWidthX, iUpturn;
static double fTension, fTongueDown, fTongueUp;

#define SETPOINT(a,b,c) aBez[a].x = (b); aBez[a].y = (c)
#define INTERPF(f,a,b) ((1-(f)) * (a) + (f) * (b))
#define INTERP(f,a,b) ((int) INTERPF(f,a,b))

static DWORD Bezier(POINT *paIn, POINT *paOut, DWORD dwDepth) {
  DWORD dwTotal;
  POINT Mid, aNew[4];
  if (!dwDepth) { memcpy(paOut, paIn, 3 * sizeof(POINT)); return 3; }
  Mid.x = (paIn[1].x + paIn[2].x) / 2;
  Mid.y = (paIn[1].y + paIn[2].y) / 2;
  aNew[0] = paIn[0];
  aNew[1].x = (paIn[0].x + paIn[1].x) / 2; aNew[1].y = (paIn[0].y + paIn[1].y) / 2;
  aNew[2].x = (Mid.x + paIn[1].x) / 2; aNew[2].y = (Mid.y + paIn[1].y) / 2;
  aNew[3] = Mid;
  dwTotal = Bezier(aNew, paOut, dwDepth - 1);
  aNew[0] = Mid;
  aNew[1].x = (Mid.x + paIn[2].x) / 2; aNew[1].y = (Mid.y + paIn[2].y) / 2;
  aNew[2].x = (paIn[3].x + paIn[2].x) / 2; aNew[2].y = (paIn[3].y + paIn[2].y) / 2;
  aNew[3] = paIn[3];
  return dwTotal + Bezier(aNew, paOut + dwTotal, dwDepth - 1);
}

static void Mirror(int iMirrorX, POINT *paBuf, DWORD dwNum) {
  DWORD i;
  for (i = 0; i < dwNum; i++) {
    paBuf[dwNum+i].x = iMirrorX - (paBuf[dwNum-i-1].x - iMirrorX);
    paBuf[dwNum+i].y = paBuf[dwNum-i-1].y;
  }
}

static void CalcMaxParams(RECT *pRect) {
  iCenterX = (pRect->right + pRect->left) / 2;
  iCenterY = (pRect->top * 2 + pRect->bottom) / 3;
  iMaxWidthX = (int)((pRect->right - pRect->left) * .45f);
  iMinWidthX = iMaxWidthX * 2 / 3;
  iMaxHeightY = iMaxWidthX * 2 / 3;
  iMaxTopLipHeight = iMaxWidthX / (gfMale ? 7 : 5);
  iMaxBottomLipHeight = iMaxWidthX / (gfMale ? 6 : 4);
  iMaxTopTeethHeight = iMaxWidthX / 6;
  iMaxBottomTeethHeight = iMaxWidthX / 8;
}

static void CalcCurParams(PTTSMOUTH pMouth) {
  iTopLipAboveTeeth = iMaxTopTeethHeight * pMouth->bTeethUpperVisible / 256;
  iBottomLipBelowTeeth = iMaxBottomTeethHeight * pMouth->bTeethLowerVisible / 256;
  iMouthWidthX = iMinWidthX + (iMaxWidthX - iMinWidthX) * pMouth->bMouthWidth / 256;
  iMouthHeightY = iMaxHeightY * pMouth->bMouthHeight / 256;
  if (pMouth->bMouthUpturn >= 0x80)
    iUpturn = -(iMouthWidthX * ((int)pMouth->bMouthUpturn - 0x80) / 128 / 10);
  else
    iUpturn = -(iMouthWidthX * ((int)pMouth->bMouthUpturn - 0x80) / 128 / 20);
  iTopLipHeight = iMaxTopLipHeight;
  iBottomLipHeight = iMaxBottomLipHeight;
  iMidLipWidthX = iMouthWidthX / 2;
  fTension = pMouth->bLipTension / 255.0;
  fTongueDown = fTongueUp = 0;
  if (pMouth->bTonguePosn < 0x80) fTongueDown = (0x80 - (double)pMouth->bTonguePosn) / 128.0;
  else fTongueUp = ((double)pMouth->bTonguePosn - 0x80) / 128.0;
}

static void DrawLips(HDC hdc) {
  HBRUSH redBrushMale = CreateSolidBrush(RGB(199,100,90));
  HBRUSH redBrushFemale = CreateSolidBrush(RGB(206,28,28));
  HBRUSH oldBrush = (HBRUSH)SelectObject(hdc, gfMale ? redBrushMale : redBrushFemale);
  int nLeft = iCenterX - iMouthWidthX;
  POINT aBuf[128], aBez[4];
  DWORD dwCur;
  int iBottomLip = iCenterY + iMouthHeightY + iBottomLipBelowTeeth;
  int iBottomLipBottom = iCenterY + iMouthHeightY + iBottomLipBelowTeeth + iBottomLipHeight;
  int iTopLip, iTopLipBottom;
  iBottomLip = INTERP(INTERPF(fTension, 0, .9), iBottomLip, iCenterY);
  iBottomLipBottom = INTERP(INTERPF(fTension, 0, .8), iBottomLipBottom, iCenterY + iBottomLipHeight);
  dwCur = 0;
  SETPOINT(0, iCenterX, iBottomLip);
  SETPOINT(1, INTERP(INTERPF(fTension,.6,.8),nLeft,iCenterX), INTERP(1.0,iCenterY,iBottomLip)+iUpturn/3);
  SETPOINT(2, INTERP(INTERPF(fTension,.2,.5),nLeft,iCenterX), INTERP(INTERPF(fTension,.33,.1),iCenterY,iBottomLip)+iUpturn*2/3);
  SETPOINT(3, nLeft, INTERP(0,iCenterY,iBottomLip)+iUpturn);
  dwCur += Bezier(aBez,aBuf+dwCur,3);
  SETPOINT(0,nLeft,INTERP(0,iCenterY,iBottomLipBottom)+iUpturn);
  SETPOINT(1,INTERP(INTERPF(fTension,.2,.4),nLeft,iCenterX),INTERP(INTERPF(fTension,.33,.2),iCenterY,iBottomLipBottom)+iUpturn*2/3);
  SETPOINT(2,INTERP(INTERPF(fTension,.6,.8),nLeft,iCenterX),INTERP(1.0,iCenterY,iBottomLipBottom)+iUpturn/3);
  SETPOINT(3,iCenterX,iBottomLipBottom);
  dwCur += Bezier(aBez,aBuf+dwCur,3);
  Mirror(iCenterX,aBuf,dwCur); Polygon(hdc,aBuf,dwCur*2);
  dwCur = 0;
  iTopLip = iCenterY - iTopLipAboveTeeth - iTopLipHeight;
  iTopLipBottom = iCenterY - iTopLipAboveTeeth;
  SETPOINT(0,iCenterX,iTopLip);
  SETPOINT(1,INTERP(.95,nLeft,iCenterX),iTopLip);
  SETPOINT(2,INTERP(.9,nLeft,iCenterX),iTopLip-iTopLipHeight/10);
  SETPOINT(3,INTERP(.8,nLeft,iCenterX),iTopLip-iTopLipHeight/8);
  dwCur += Bezier(aBez,aBuf+dwCur,2);
  SETPOINT(0,INTERP(.8,nLeft,iCenterX),iTopLip-iTopLipHeight/8);
  SETPOINT(1,INTERP(INTERPF(fTension,.5,.6),nLeft,iCenterX),INTERP(.6,iCenterY,iTopLip)+iUpturn/3);
  SETPOINT(2,INTERP(INTERPF(fTension,.2,.3),nLeft,iCenterX),INTERP(.3,iCenterY,iTopLip)+iUpturn*2/3);
  SETPOINT(3,nLeft,iCenterY+iUpturn);
  dwCur += Bezier(aBez,aBuf+dwCur,3);
  SETPOINT(0,nLeft,iCenterY+iUpturn);
  SETPOINT(1,INTERP(INTERPF(fTension,.33,.5),nLeft,iCenterX),INTERP(INTERPF(fTension,.5,0),iCenterY,iTopLipBottom)+iTopLipHeight/8+iUpturn*2/3);
  SETPOINT(2,INTERP(INTERPF(fTension,.66,.8),nLeft,iCenterX),INTERP(INTERPF(fTension,.75,0),iCenterY,iTopLipBottom)+iUpturn/3);
  SETPOINT(3,iCenterX,INTERP(INTERPF(fTension,1.0,.4),iCenterY,iTopLipBottom)+iTopLipHeight/6);
  dwCur += Bezier(aBez,aBuf+dwCur,3);
  Mirror(iCenterX,aBuf,dwCur); Polygon(hdc,aBuf,dwCur*2);
  SelectObject(hdc,oldBrush); DeleteObject(redBrushMale); DeleteObject(redBrushFemale);
}

static void DrawSkin(HDC hdc) {
  HBRUSH skinBrush = CreateSolidBrush(RGB(199,143,103));
  HBRUSH oldBrush = (HBRUSH)SelectObject(hdc,skinBrush);
  HPEN oldPen = (HPEN)SelectObject(hdc,GetStockObject(NULL_PEN));
  int nLeft = iCenterX - iMouthWidthX;
  POINT aBuf[128], aBez[4]; DWORD dwCur = 0;
  int iBottomLip = iCenterY+iMouthHeightY+iBottomLipBelowTeeth;
  int iBottomLipBottom = iCenterY+iMouthHeightY+iBottomLipBelowTeeth+iBottomLipHeight;
  int iTopLip = iCenterY-iTopLipAboveTeeth-iTopLipHeight;
  iBottomLip = INTERP(INTERPF(fTension,0,.9),iBottomLip,iCenterY);
  iBottomLipBottom = INTERP(INTERPF(fTension,0,.8),iBottomLipBottom,iCenterY+iBottomLipHeight);
  SETPOINT(0,iCenterX,iBottomLipBottom);
  SETPOINT(1,INTERP(INTERPF(fTension,.6,.8),nLeft,iCenterX),INTERP(1.0,iCenterY,iBottomLipBottom)+iUpturn/3);
  SETPOINT(2,INTERP(INTERPF(fTension,.2,.4),nLeft,iCenterX),INTERP(INTERPF(fTension,.33,.2),iCenterY,iBottomLipBottom)+iUpturn*2/3);
  SETPOINT(3,nLeft,INTERP(0,iCenterY,iBottomLipBottom)+iUpturn);
  dwCur += Bezier(aBez,aBuf+dwCur,3);
  SETPOINT(0,nLeft,iCenterY+iUpturn);
  SETPOINT(1,INTERP(INTERPF(fTension,.2,.3),nLeft,iCenterX),INTERP(.3,iCenterY,iTopLip)+iUpturn*2/3);
  SETPOINT(2,INTERP(INTERPF(fTension,.5,.6),nLeft,iCenterX),INTERP(.6,iCenterY,iTopLip)+iUpturn/3);
  SETPOINT(3,INTERP(.8,nLeft,iCenterX),iTopLip-iTopLipHeight/8);
  dwCur += Bezier(aBez,aBuf+dwCur,3);
  SETPOINT(0,INTERP(.8,nLeft,iCenterX),iTopLip-iTopLipHeight/8);
  SETPOINT(1,INTERP(.9,nLeft,iCenterX),iTopLip);
  SETPOINT(2,INTERP(.95,nLeft,iCenterX),iTopLip);
  SETPOINT(3,iCenterX,iTopLip);
  dwCur += Bezier(aBez,aBuf+dwCur,2);
  aBuf[dwCur]=aBez[3]; dwCur++;
  aBuf[dwCur].x=iCenterX; aBuf[dwCur].y=-10; dwCur++;
  aBuf[dwCur].x=-10; aBuf[dwCur].y=-10; dwCur++;
  aBuf[dwCur].x=-10; aBuf[dwCur].y=1000; dwCur++;
  Mirror(iCenterX,aBuf,dwCur); Polygon(hdc,aBuf,dwCur*2);
  SelectObject(hdc,oldBrush); SelectObject(hdc,oldPen); DeleteObject(skinBrush);
}

static void DrawTeeth(HDC hdc) {
  HBRUSH whiteBrush = CreateSolidBrush(RGB(244,245,216));
  HBRUSH oldBrush = (HBRUSH)SelectObject(hdc,whiteBrush);
  int nLeft=iCenterX-iMaxWidthX;
  POINT aBuf[128],aBez[4]; DWORD dwCur=0;
  int iBottomTeeth=iCenterY+iMouthHeightY;
  int iBottomTeethBottom=iCenterY+iMouthHeightY+iMaxBottomTeethHeight;
  SETPOINT(0,iCenterX,iBottomTeeth);
  SETPOINT(1,INTERP(.6,nLeft,iCenterX),INTERP(1.0,iCenterY,iBottomTeeth));
  SETPOINT(2,INTERP(.2,nLeft,iCenterX),INTERP(.33,iCenterY,iBottomTeeth));
  SETPOINT(3,nLeft,INTERP(0,iCenterY,iBottomTeeth));
  dwCur+=Bezier(aBez,aBuf+dwCur,3);
  SETPOINT(0,nLeft,INTERP(0,iCenterY,iBottomTeeth));
  SETPOINT(1,nLeft,INTERP(0,iCenterY,iBottomTeeth));
  SETPOINT(2,nLeft,iCenterY+iMaxBottomTeethHeight);
  SETPOINT(3,nLeft,iCenterY+iMaxBottomTeethHeight);
  dwCur+=Bezier(aBez,aBuf+dwCur,2);
  SETPOINT(0,nLeft,iCenterY+iMaxBottomTeethHeight);
  SETPOINT(1,INTERP(.2,nLeft,iCenterX),INTERP(.33,iCenterY+iMaxBottomTeethHeight,iBottomTeethBottom));
  SETPOINT(2,INTERP(.6,nLeft,iCenterX),INTERP(1.0,iCenterY+iMaxBottomTeethHeight,iBottomTeethBottom));
  SETPOINT(3,iCenterX,iBottomTeethBottom);
  dwCur+=Bezier(aBez,aBuf+dwCur,3);
  Mirror(iCenterX,aBuf,dwCur); Polygon(hdc,aBuf,dwCur*2);
  dwCur=0;
  SETPOINT(0,iCenterX,iCenterY+iMaxTopTeethHeight/6);
  SETPOINT(1,INTERP(.85,nLeft,iCenterX),iCenterY+iMaxTopTeethHeight/6);
  SETPOINT(2,INTERP(.8,nLeft,iCenterX),iCenterY);
  SETPOINT(3,INTERP(.8,nLeft,iCenterX),iCenterY);
  dwCur+=Bezier(aBez,aBuf+dwCur,1);
  SETPOINT(0,INTERP(.75,nLeft,iCenterX),iCenterY);
  SETPOINT(1,INTERP(.5,nLeft,iCenterX),iCenterY-iMaxTopTeethHeight/10);
  SETPOINT(2,INTERP(.25,nLeft,iCenterX),iCenterY-iMaxTopTeethHeight/6);
  SETPOINT(3,nLeft,iCenterY-iMaxTopTeethHeight/3);
  dwCur+=Bezier(aBez,aBuf+dwCur,1);
  SETPOINT(0,nLeft,iCenterY-iMaxTopTeethHeight/3);
  SETPOINT(1,nLeft,iCenterY-iMaxTopTeethHeight/3);
  SETPOINT(2,nLeft,iCenterY-iMaxTopTeethHeight);
  SETPOINT(3,nLeft,iCenterY-iMaxTopTeethHeight);
  dwCur+=Bezier(aBez,aBuf+dwCur,1);
  SETPOINT(0,nLeft,iCenterY-iMaxTopTeethHeight);
  SETPOINT(1,nLeft,iCenterY-iMaxTopTeethHeight);
  SETPOINT(2,iCenterX,iCenterY-iMaxTopTeethHeight);
  SETPOINT(3,iCenterX,iCenterY-iMaxTopTeethHeight);
  dwCur+=Bezier(aBez,aBuf+dwCur,1);
  Mirror(iCenterX,aBuf,dwCur); Polygon(hdc,aBuf,dwCur*2);
  SelectObject(hdc,oldBrush); DeleteObject(whiteBrush);
}

static void DrawTongue(HDC hdc) {
  HBRUSH tongueBrush=CreateSolidBrush(RGB(180,79,61));
  HBRUSH oldBrush=(HBRUSH)SelectObject(hdc,tongueBrush);
  int nLeft=iCenterX-iMaxWidthX*3/5;
  POINT aBuf[128],aBez[4]; DWORD dwCur=0;
  int iBottomTeethBottom=iCenterY+iMouthHeightY+iMaxBottomTeethHeight;
  int iTongueTop=iCenterY+iMaxTopTeethHeight/2;
  int iTongueBottom=iTongueTop+iMaxTopTeethHeight*5/2;
  int iTopTeeth=iCenterY-2*iMaxTopTeethHeight;
  int iInterp;
  SETPOINT(0,iCenterX,INTERP(fTongueUp,iTongueTop,iTopTeeth));
  SETPOINT(1,INTERP(.8,nLeft,iCenterX),INTERP(fTongueUp,INTERP(1.1,iTongueBottom,iTongueTop),iTopTeeth));
  SETPOINT(2,nLeft,INTERP(.8,iTongueBottom,iTongueTop));
  SETPOINT(3,nLeft,INTERP(.5,iTongueBottom,iTongueTop));
  dwCur+=Bezier(aBez,aBuf+dwCur,3);
  SETPOINT(0,nLeft,INTERP(.5,iTongueBottom,iTongueTop));
  SETPOINT(1,nLeft,INTERP(.3,iTongueBottom,iTongueTop));
  iInterp=INTERP(fTongueDown,iTongueBottom,iBottomTeethBottom);
  SETPOINT(2,INTERP(.5,nLeft,iCenterX),max(iTongueBottom,iInterp));
  SETPOINT(3,iCenterX,max(iTongueBottom,iInterp));
  dwCur+=Bezier(aBez,aBuf+dwCur,3);
  Mirror(iCenterX,aBuf,dwCur); Polygon(hdc,aBuf,dwCur*2);
  SelectObject(hdc,oldBrush); DeleteObject(tongueBrush);
}

static void PaintMouth(TTSMOUTH *mouth,HDC hdc,RECT *rect) {
  HBRUSH blackBrush=CreateSolidBrush(RGB(101,37,39));
  CalcMaxParams(rect); CalcCurParams(mouth);
  FillRect(hdc,rect,blackBrush);
  DrawTongue(hdc); DrawTeeth(hdc); DrawSkin(hdc); DrawLips(hdc);
  DeleteObject(blackBrush);
}

static int write_bmp(const char *path,const TTSMOUTH *mouth,int male,int width,int height) {
  BITMAPINFO info; BITMAPFILEHEADER fileHeader; HDC screen,dc; HBITMAP bitmap,oldBitmap;
  void *pixels=NULL; FILE *out; RECT rect={0,0,width,height}; DWORD pixelBytes=(DWORD)(width*height*4);
  ZeroMemory(&info,sizeof(info)); info.bmiHeader.biSize=sizeof(BITMAPINFOHEADER);
  info.bmiHeader.biWidth=width; info.bmiHeader.biHeight=-height; info.bmiHeader.biPlanes=1;
  info.bmiHeader.biBitCount=32; info.bmiHeader.biCompression=BI_RGB; info.bmiHeader.biSizeImage=pixelBytes;
  screen=GetDC(NULL); dc=CreateCompatibleDC(screen);
  bitmap=CreateDIBSection(screen,&info,DIB_RGB_COLORS,&pixels,NULL,0); ReleaseDC(NULL,screen);
  if(!dc||!bitmap||!pixels) return 0;
  oldBitmap=(HBITMAP)SelectObject(dc,bitmap); gfMale=male?TRUE:FALSE;
  PaintMouth((TTSMOUTH*)mouth,dc,&rect); GdiFlush();
  ZeroMemory(&fileHeader,sizeof(fileHeader)); fileHeader.bfType=0x4d42;
  fileHeader.bfOffBits=sizeof(BITMAPFILEHEADER)+sizeof(BITMAPINFOHEADER);
  fileHeader.bfSize=fileHeader.bfOffBits+pixelBytes;
  out=fopen(path,"wb");
  if(!out){SelectObject(dc,oldBitmap);DeleteObject(bitmap);DeleteDC(dc);return 0;}
  fwrite(&fileHeader,sizeof(fileHeader),1,out); fwrite(&info.bmiHeader,sizeof(info.bmiHeader),1,out);
  fwrite(pixels,1,pixelBytes,out); fclose(out);
  SelectObject(dc,oldBitmap); DeleteObject(bitmap); DeleteDC(dc); return 1;
}

static void usage(void){
  fputs("original-mouth --output FRAME.bmp --gender male|female --mouth h,w,u,j,ut,lt,tongue,tension [--width N --height N]\n",stderr);
}

int main(int argc,char **argv){
  const char *output=NULL,*gender="male",*mouthArg=NULL; int width=130,height=110,i;
  unsigned int values[8]; TTSMOUTH mouth;
  for(i=1;i<argc;i++){
    if(!strcmp(argv[i],"--output")&&i+1<argc)output=argv[++i];
    else if(!strcmp(argv[i],"--gender")&&i+1<argc)gender=argv[++i];
    else if(!strcmp(argv[i],"--mouth")&&i+1<argc)mouthArg=argv[++i];
    else if(!strcmp(argv[i],"--width")&&i+1<argc)width=atoi(argv[++i]);
    else if(!strcmp(argv[i],"--height")&&i+1<argc)height=atoi(argv[++i]);
    else {usage();return 2;}
  }
  if(!output||!mouthArg||width<16||height<16||
    sscanf(mouthArg,"%u,%u,%u,%u,%u,%u,%u,%u",&values[0],&values[1],&values[2],&values[3],&values[4],&values[5],&values[6],&values[7])!=8){usage();return 2;}
  for(i=0;i<8;i++)if(values[i]>255){usage();return 2;}
  mouth.bMouthHeight=(BYTE)values[0]; mouth.bMouthWidth=(BYTE)values[1];
  mouth.bMouthUpturn=(BYTE)values[2]; mouth.bJawOpen=(BYTE)values[3];
  mouth.bTeethUpperVisible=(BYTE)values[4]; mouth.bTeethLowerVisible=(BYTE)values[5];
  mouth.bTonguePosn=(BYTE)values[6]; mouth.bLipTension=(BYTE)values[7];
  if(!write_bmp(output,&mouth,!strcmp(gender,"male"),width,height)){fprintf(stderr,"Could not write mouth bitmap\n");return 2;}
  return 0;
}
