import './index.module.less';

const CHeader = () => {
  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center justify-center flex-grow">
        <img src="./images/wallet-logo.png" className="w-10 h-10 select-none" alt="" />
        <div className="text-2xl font-semibold tracking-widest select-none">UNISAT</div>
      </div>
      <div className="flex-grow-1"></div>
    </div>
  );
};

export default CHeader;
