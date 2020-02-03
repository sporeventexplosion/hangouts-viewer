function tryget(func, fallback) {
  try {
    return func();
  }
  catch (ex) {
    return fallback;
  }
}

export default tryget;
