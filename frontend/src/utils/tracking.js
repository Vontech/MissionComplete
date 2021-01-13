

export const startTracking = async (user) => {
  window.woopra.identify({
    email: user.email,
    name: user.username
  });

  // The identify code should be added before the "track()" function
  window.woopra.track();
}

export const trackAction = (actionType, metadata = {}) => {
  window.woopra.track(actionType, metadata);
}