import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import type { AvatarType } from '../../types';
import { BADGE_IMAGE, CERT_BG_IMAGE } from '../../assets';

interface MissionCeremonyProps {
  name: string;
  code: string;
  avatar: AvatarType;
  stars: Record<number, number>;
  totalScore: number;
  pledges: string[];
  rank: number;
  onShowLeaderboard: () => void;
  onGoMap: () => void;
}

export function MissionCeremony({
  name,
  code,
  avatar,
  stars,
  totalScore,
  pledges,
  rank,
  onShowLeaderboard,
  onGoMap
}: MissionCeremonyProps) {
  const [certUrl, setCertUrl] = useState<string>('');
  const [downloadMsg, setDownloadMsg] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Launch celebratory confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    const renderCertificate = async () => {
      try {
        if (document.fonts) {
          await document.fonts.load('60px Jua');
          await document.fonts.load('30px "Gowun Dodum"');
        }
      } catch {
        // Font loading fallback
      }

      const loadImg = (src: string) =>
        new Promise<HTMLImageElement | null>(res => {
          const im = new Image();
          im.onload = () => res(im);
          im.onerror = () => res(null);
          im.src = src;
        });
      const [bg, badge] = await Promise.all([loadImg(CERT_BG_IMAGE), loadImg(BADGE_IMAGE)]);

      const W = 1754;
      const H = 1177; // cert-bg 그림과 같은 비율
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (bg) ctx.drawImage(bg, 0, 0, W, H);
      else {
        ctx.fillStyle = '#fffaf0';
        ctx.fillRect(0, 0, W, H);
      }

      const D = "Jua, 'Gowun Dodum', sans-serif";
      const B = "'Gowun Dodum', sans-serif";
      const CX = W / 2;
      const outlined = (text: string, x: number, y: number, size: number, fill: string, stroke = '#5a3424', sw = size / 7) => {
        ctx.font = `${size}px ${D}`;
        ctx.textAlign = 'center';
        ctx.lineJoin = 'round';
        ctx.lineWidth = sw;
        ctx.strokeStyle = stroke;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
      };

      // 배지 (위 가운데) + 리본 글자
      if (badge) {
        const bw = 200;
        const bh = (badge.height / badge.width) * bw;
        ctx.save();
        ctx.shadowColor = 'rgba(255, 200, 60, 0.7)';
        ctx.shadowBlur = 30;
        ctx.drawImage(badge, CX - bw / 2, 62, bw, bh);
        ctx.restore();
        ctx.font = `21px ${D}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7a4a10';
        ctx.fillText('지구레인저', CX, 62 + bh * 0.885);
      }

      // 제목
      outlined('임 명 장', CX, 345, 92, '#ffd84d', '#5a3424', 14);
      ctx.font = `34px ${D}`;
      ctx.fillStyle = '#d0603f';
      ctx.textAlign = 'center';
      ctx.fillText('지구수비대 정식 지구레인저', CX, 398);

      // 이름
      ctx.font = `76px ${D}`;
      ctx.fillStyle = '#1d4f8a';
      ctx.fillText(`${name} 레인저`, CX, 492);
      ctx.strokeStyle = '#e0b400';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(CX - 260, 512);
      ctx.lineTo(CX + 260, 512);
      ctx.stroke();
      ctx.font = `28px ${B}`;
      ctx.fillStyle = '#8a6a55';
      ctx.fillText(`코드네임  ${code}`, CX, 552);

      // 임명 문구
      ctx.font = `bold 31px ${B}`;
      ctx.fillStyle = '#3b2414';
      [
        '위 수련생은 기후변화의 원인을 밝히고 기후 마법을 익혀',
        '탄소 대마왕을 물리치고 아기 북극곰 포리를 엄마 품으로 돌려보냈기에',
        '지구수비대의 정식 지구레인저로 임명합니다.'
      ].forEach((line, k) => ctx.fillText(line, CX, 615 + k * 46));

      // 작전 기록 · 실천 약속 상자
      const box = (x: number, y: number, w: number, h: number) => {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
        ctx.strokeStyle = '#c9a24a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, 22);
        else ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };
      const BY = 765;
      const BH = 165;
      box(560, BY, 300, BH);
      box(880, BY, 420, BH);

      ctx.textAlign = 'left';
      ctx.font = `27px ${D}`;
      ctx.fillStyle = '#a0522d';
      ctx.fillText('작전 기록', 584, BY + 38);
      ctx.font = `bold 21px ${B}`;
      ['이상 신호', '범인 찾기', '탄소 저울', '빙하 되찾기', '최종 결전'].forEach((t, k) => {
        const n = stars[k + 1] || 0;
        const yy = BY + 66 + k * 22;
        ctx.fillStyle = '#3b2414';
        ctx.fillText(t, 584, yy);
        ctx.fillStyle = '#f0a500';
        ctx.fillText('★'.repeat(n) + '☆'.repeat(3 - n), 740, yy);
      });

      ctx.font = `27px ${D}`;
      ctx.fillStyle = '#2e7d4f';
      ctx.fillText('나의 실천 약속', 904, BY + 38);
      ctx.font = `bold 22px ${B}`;
      ctx.fillStyle = '#3b2414';
      (pledges.length > 0 ? pledges : ['지구와 북극곰을 꾸준히 지키기']).slice(0, 3).forEach((pl, k) => {
        ctx.fillText(`${k + 1}. ${pl}`, 904, BY + 76 + k * 32);
      });

      // 총점 · 날짜 · 서명
      ctx.textAlign = 'center';
      outlined(`총점 ${totalScore.toLocaleString()}점`, 930, 1000, 44, '#ffffff', '#d0603f', 8);
      ctx.font = `24px ${B}`;
      ctx.fillStyle = '#7a5a43';
      ctx.fillText(
        new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        930,
        1040
      );
      ctx.font = `30px ${D}`;
      ctx.fillStyle = '#3b2414';
      ctx.fillText('지구수비대장  단비', 930, 1085);
      // 도장 (배지)
      if (badge) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(badge, 1075, 1030, 80, (badge.height / badge.width) * 80);
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png');
      setCertUrl(dataUrl);
    };

    renderCertificate();
  }, [name, code, avatar, stars, totalScore, pledges]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    try {
      const a = document.createElement('a');
      a.href = canvasRef.current.toDataURL('image/png');
      a.download = `지구레인저_임명장_${name || '레인저'}.png`;
      a.click();
      setDownloadMsg('임명장을 이미지(PNG)로 저장했습니다!');
    } catch {
      setDownloadMsg('이미지를 길게 누르거나 우클릭하여 저장해 주세요.');
    }
  };

  const handleDownloadPDF = () => {
    if (!canvasRef.current) return;
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const imgData = canvasRef.current.toDataURL('image/jpeg', 0.95);
      // A4 가로(297×210mm) 가운데에 그림 비율 그대로 놓는다
      const ph = (297 * 1177) / 1754;
      doc.setFillColor(255, 250, 240);
      doc.rect(0, 0, 297, 210, 'F');
      doc.addImage(imgData, 'JPEG', 0, (210 - ph) / 2, 297, ph);
      doc.save(`지구레인저_임명장_${name || '레인저'}.pdf`);
      setDownloadMsg('임명장을 PDF 문서로 저장했습니다!');
    } catch {
      setDownloadMsg('PDF 생성 오류가 발생했습니다. PNG 저장을 이용해 주세요.');
    }
  };

  return (
    <div className="panel max-w-4xl text-center">
      <h2>
        <span className="tag">🎉 축하합니다!</span>
        지구레인저 임명식
      </h2>
      <p className="guide">
        {name} 대원의 총점은 <b>{totalScore.toLocaleString()}점</b>, 이 기기 순위{' '}
        <b>{rank > 0 ? `${rank}위` : '1위'}</b>입니다!
      </p>

      {certUrl ? (
        <div className="my-3">
          <img
            src={certUrl}
            alt={`${name} 레인저의 지구레인저 임명장`}
            className="w-full rounded-2xl border-4 border-amber-950 shadow-xl"
          />
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center font-display text-lg text-amber-900">
          임명장을 인쇄하고 있어요...
        </div>
      )}

      {downloadMsg && (
        <p className="text-sm font-bold text-emerald-800 my-2">{downloadMsg}</p>
      )}

      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        <button className="big" type="button" onClick={handleDownloadPNG}>
          이미지(PNG)로 저장
        </button>
        <button className="big blue" type="button" onClick={handleDownloadPDF}>
          PDF로 저장
        </button>
        <button className="big ghost" type="button" onClick={onShowLeaderboard}>
          최우수 순위표
        </button>
        <button className="big ghost" type="button" onClick={onGoMap}>
          작전 지도로
        </button>
      </div>
    </div>
  );
}
