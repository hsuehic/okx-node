export const wrapData = <T>(data: T) => {
  return {
    code: '0',
    msg: '',
    data,
  };
};
