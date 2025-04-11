import { useEffect } from 'react';

const AdsterraSocialBar = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pl26348447.profitableratecpm.com/87/18/76/871876dbc6ac9fa9c07eef8d57865e94.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup when component unmounts
    };
  }, []);

  return null;
};

export default AdsterraSocialBar;
