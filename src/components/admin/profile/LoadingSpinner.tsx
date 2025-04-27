
const LoadingSpinner = () => {
  return (
    <div className="container mx-auto py-6 flex items-center justify-center h-48">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2">Carregando perfil...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
