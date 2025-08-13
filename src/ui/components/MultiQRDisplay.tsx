import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

import { Column, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';

interface MultiQRDisplayProps {
  parts: string[];
  size?: number;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
}

export default function MultiQRDisplay({
  parts,
  size = 400,
  autoPlay = true,
  interval = 1000,
  showControls = true
}: MultiQRDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoPlay || parts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % parts.length;
        console.log(`QR Display: Switching from part ${prev} to part ${nextIndex}`);
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, parts.length, interval]);

  const renderQRCode = (value: string, index: number) => {
    try {
      return <QRCode value={value} size={size} level="L" includeMargin={true} bgColor="#FFFFFF" fgColor="#000000" />;
    } catch (error) {
      console.error(`QR code generation failed for part ${index}:`, error);
      console.log(`Part ${index} length: ${value.length} characters`);
      setQrError(`QR generation failed (Part ${index + 1}): Data too long (${value.length} characters)`);
      return (
        <div
          style={{
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ccc',
            borderRadius: '8px'
          }}>
          <Text text={`Part ${index + 1}\nData too long`} textCenter color="red" size="sm" />
        </div>
      );
    }
  };

  if (parts.length === 0) {
    return (
      <Column itemsCenter>
        <Text text="No QR data available" color="red" />
      </Column>
    );
  }

  if (qrError) {
    return (
      <Column itemsCenter gap="md">
        <Text text={qrError} color="red" textCenter />
        <Text
          text="Please try using smaller transaction data or contact technical support"
          size="sm"
          color="textDim"
          textCenter
        />
      </Column>
    );
  }

  if (parts.length === 1) {
    return <Column itemsCenter>{renderQRCode(parts[0], 0)}</Column>;
  }

  return (
    <Column itemsCenter gap="md">
      {renderQRCode(parts[currentIndex], currentIndex)}

      <Text text={`Part ${currentIndex + 1} of ${parts.length}`} preset="bold" textCenter />

      <div
        style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'center'
        }}>
        {parts.map((_, index) => (
          <div
            key={index}
            onClick={() => showControls && setCurrentIndex(index)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? colors.primary : '#e0e0e0',
              cursor: showControls ? 'pointer' : 'default'
            }}
          />
        ))}
      </div>

      <Text
        text="Multiple QR codes rotating - scan all parts with your mobile app"
        size="sm"
        color="textDim"
        style={{ textAlign: 'center' }}
      />

      <div style={{ marginTop: '8px' }}>
        <Text
          text={`Current Part ${currentIndex + 1} (${parts[currentIndex]?.length || 0} characters)`}
          size="xs"
          color="textDim"
          textCenter
        />
      </div>
    </Column>
  );
}
