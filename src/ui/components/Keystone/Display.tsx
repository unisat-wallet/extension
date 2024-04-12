import { AnimatedQRCode } from '@keystonehq/animated-qr';

export default function KeystoneDisplay(props: {
  type: string
  cbor: string
}) {
  return <div className="keystone-display">
    <AnimatedQRCode type={props.type} cbor={props.cbor} options={{
      size: 200
    }} />
  </div>;
}
