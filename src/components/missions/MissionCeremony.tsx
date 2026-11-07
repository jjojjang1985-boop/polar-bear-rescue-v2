import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import type { AvatarType } from '../../types';
import { danbiSVG, heroSVG, lukaSVG, poriSVG, thermoSVG } from '../../svgs';

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

function svgToImage(svg: string): Promise<HTMLImageElement | null> {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
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

      const W = 1754;
      const H = 1240;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#fffdf3');
      grad.addColorStop(1, '#fff1cc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Border frames
      ctx.strokeStyle = '#4a2a12';
      ctx.lineWidth = 14;
      ctx.strokeRect(36, 36, W - 72, H - 72);

      ctx.strokeStyle = '#e0b400';
      ctx.lineWidth = 6;
      ctx.strokeRect(64, 64, W - 128, H - 128);

      const D = "Jua, 'Gowun Dodum', sans-serif";
      const B = "'Gowun Dodum', sans-serif";

      const drawOutlinedText = (text: string, x: number, y: number, size: number, fill: string) => {
        ctx.font = `${size}px ${D}`;
        ctx.textAlign = 'center';
        ctx.lineJoin = 'round';
        ctx.lineWidth = size / 6;
        ctx.strokeStyle = '#4a2a12';
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
      };

      drawOutlinedText('임 명 장', W / 2, 230, 130, '#ffe14d');

      ctx.font = `40px ${D}`;
      ctx.fillStyle = '#f2735a';
      ctx.textAlign = 'center';
      ctx.fillText('북극곰 구조대 정식 대원', W / 2, 300);

      ctx.font = `72px ${D}`;
      ctx.fillStyle = '#12407a';
      ctx.fillText(`${name} 대원`, W / 2, 420);

      ctx.font = `34px ${B}`;
      ctx.fillStyle = '#7a5a43';
      ctx.fillText(`코드네임  ${code}`, W / 2, 475);

      ctx.font = `bold 38px ${B}`;
      ctx.fillStyle = '#3b2414';
      [
        '위 대원은 기후변화의 원인을 밝히고 탄소 저울을 맞추어,',
        '녹아내리던 북극의 빙하를 되찾고 아기 북극곰 포리를',
        '엄마 곁으로 돌려보냈기에 북극곰 구조대 정식 대원으로 임명합니다.'
      ].forEach((line, i) => {
        ctx.fillText(line, W / 2, 570 + i * 58);
      });

      // Left Box: Operations Log
      const drawBox = (x: number, y: number, w: number, h: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4a2a12';
        ctx.lineWidth = 5;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, w, h, 26);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.fill();
        ctx.stroke();
      };

      drawBox(260, 770, 560, 270);
      drawBox(934, 770, 560, 270);

      ctx.textAlign = 'left';
      ctx.font = `38px ${D}`;
      ctx.fillStyle = '#4a2a12';
      ctx.fillText('작전 기록', 300, 825);

      ctx.font = `bold 30px ${B}`;
      ['지구 이상 신호', '범인 찾기', '탄소 저울', '빙하 되찾기'].forEach((t, i) => {
        ctx.fillStyle = '#3b2414';
        ctx.fillText(`작전 ${i + 1}  ${t}`, 300, 875 + i * 42);
        ctx.fillStyle = '#f0a500';
        ctx.fillText(
          '★'.repeat(stars[i + 1] || 0) + '☆'.repeat(3 - (stars[i + 1] || 0)),
          650,
          875 + i * 42
        );
      });

      // Right Box: Pledges
      ctx.font = `38px ${D}`;
      ctx.fillStyle = '#4a2a12';
      ctx.fillText('나의 실천 약속', 974, 825);

      ctx.font = `bold 30px ${B}`;
      ctx.fillStyle = '#3b2414';
      (pledges.length > 0 ? pledges : ['지구와 북극곰을 꾸준히 지키기']).forEach((p, i) => {
        ctx.fillText(`${i + 1}. ${p}`, 974, 875 + i * 48);
      });

      // Total Score
      ctx.textAlign = 'center';
      drawOutlinedText(`총점 ${totalScore.toLocaleString()}점`, W / 2, 1110, 56, '#ffffff');

      ctx.font = `30px ${B}`;
      ctx.fillStyle = '#7a5a43';
      ctx.fillText(
        new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        W / 2,
        1165
      );

      // Signature & Seal
      ctx.textAlign = 'right';
      ctx.font = `38px ${D}`;
      ctx.fillStyle = '#3b2414';
      ctx.fillText('북극곰 구조대장  단비', W - 170, 1120);

      ctx.beginPath();
      ctx.arc(W - 140, 1105, 52, 0, Math.PI * 2);
      ctx.strokeStyle = '#d23a2a';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.font = `30px ${D}`;
      ctx.fillStyle = '#d23a2a';
      ctx.textAlign = 'center';
      ctx.fillText('구조대', W - 140, 1100);
      ctx.fillText('인', W - 140, 1132);

      // Draw character illustrations around the certificate
      const imgs = await Promise.all([
        svgToImage(heroSVG('happy', avatar)),
        svgToImage(poriSVG('joy')),
        svgToImage(danbiSVG('smile')),
        svgToImage(thermoSVG('happy')),
        svgToImage(lukaSVG('grin'))
      ]);

      if (imgs[0]) ctx.drawImage(imgs[0], 96, 90, 230, 230);
      if (imgs[1]) ctx.drawImage(imgs[1], W - 330, 90, 240, 240);
      if (imgs[2]) ctx.drawImage(imgs[2], 80, 340, 190, 190);
      if (imgs[3]) ctx.drawImage(imgs[3], W - 260, 340, 180, 180);
      if (imgs[4]) ctx.drawImage(imgs[4], 80, 560, 175, 175);

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
      a.download = `북극곰구조대_임명장_${name || '대원'}.png`;
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
      doc.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      doc.save(`북극곰구조대_임명장_${name || '대원'}.pdf`);
      setDownloadMsg('임명장을 PDF 문서로 저장했습니다!');
    } catch {
      setDownloadMsg('PDF 생성 오류가 발생했습니다. PNG 저장을 이용해 주세요.');
    }
  };

  return (
    <div className="panel max-w-4xl text-center">
      <h2>
        <span className="tag">🎉 축하합니다!</span>
        북극곰 구조대 임명식
      </h2>
      <p className="guide">
        {name} 대원의 총점은 <b>{totalScore.toLocaleString()}점</b>, 이 기기 순위{' '}
        <b>{rank > 0 ? `${rank}위` : '1위'}</b>입니다!
      </p>

      {certUrl ? (
        <div className="my-3">
          <img
            src={certUrl}
            alt={`${name} 대원의 북극곰 구조대 정식 임명장`}
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
