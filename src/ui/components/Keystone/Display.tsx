import { AnimatedQRCode } from '@keystonehq/animated-qr';

export default function KeystoneDisplay(props: { type: string; cbor: string }) {
  return (
    <div className="keystone-display" style={{ height: '250px' }}>
      {props.type && props.cbor && (
        <AnimatedQRCode
          type={props.type}
          cbor={props.cbor}
          options={{
            size: 250
          }}
        />
      )}
    </div>
  );
}
