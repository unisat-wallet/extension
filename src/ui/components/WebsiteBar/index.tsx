const WebsiteBar = ({ session }: { session: { origin: string; icon: string; name: string } }) => {
  return (
    <div className="flex justify-center">
      <div className="flex items-center px-5 py-2 bg-soft-black  rounded-lg">
        <img src={session.icon} className="w-10 h-10" />
        <div className="text-15 font-medium ">{session.origin}</div>
      </div>
    </div>
  );
};

export default WebsiteBar;
