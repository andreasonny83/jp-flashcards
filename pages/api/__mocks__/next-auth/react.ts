let _mockValue;

export const mockSession = (mockValue: any) => {
  _mockValue = mockValue;
};

export const getSession = () => {
  return _mockValue;
};
