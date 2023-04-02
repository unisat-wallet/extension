import InscriptionPreview from '../InscriptionPreview';
import './index.less';

export default function BRC20CardStack() {
  const data: any = {
    id: 'e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
    num: 204,
    number: 204,
    detail: {
      id: 'e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
      address: 'tb1p29a2lp3ae7f6zdtxfwldunwzr8q9ff3lm4dcky98c2mphkxnu28sy8lt4x',
      output_value: 546,
      preview: 'https://ordinals.com/preview/e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
      content: 'https://ordinals.com/content/e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0',
      content_length: 16,
      content_type: 'text/plain',
      timestamp: '2023-02-28 09:25:57 UTC',
      genesis_transaction: 'e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1a',
      location: '1d63091909daf0e82949f40b01a05a41ed8511014f692912d5ff5480210b06b5:0:0',
      output: '1d63091909daf0e82949f40b01a05a41ed8511014f692912d5ff5480210b06b5:0',
      offset: 0,
      content_body: ''
    }
  };

  return (
    <div className="container">
      <div className="card">
        <InscriptionPreview data={data} preset="medium" />
      </div>
      <div className="card">
        <InscriptionPreview data={data} preset="medium" />
      </div>
      <div className="card">
        <InscriptionPreview data={data} preset="medium" />
      </div>
    </div>
  );
}
