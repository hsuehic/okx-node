// import { useEffect } from 'react';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname === '/order') {
      navigate('/order/pending');
    }
  });
  return <Outlet />;
};
