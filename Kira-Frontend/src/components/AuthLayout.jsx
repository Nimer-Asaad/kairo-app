import AuthHero from "./AuthHero";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Form Area */}
      <div className="flex-1 lg:basis-1/2 flex items-start justify-center lg:justify-start px-6 sm:px-10 lg:px-16 py-10 lg:py-14">
        <div className="w-full max-w-[480px] lg:ml-4 xl:ml-8">
          {children}
        </div>
      </div>

      {/* Right Panel - Hero */}
      <div className="hidden lg:block lg:basis-1/2 h-screen">
        <AuthHero />
      </div>
    </div>
  );
};

export default AuthLayout;
