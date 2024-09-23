export const saveLocalStorageData = (name: string, value: string) => {
  try {
    localStorage.setItem(name, value);
  } catch (error) {
    console.log("error :>> ", error);
  }
};

export const getLocalStorageData = (name: string) => {
  return localStorage.getItem(name);
};
