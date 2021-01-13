

export const startTracking = async (user) => {
  woopra.identify({
    email: user.email,
    name: user.username
  });

  // The identify code should be added before the "track()" function
  woopra.track();
}

export const trackAction = (actionType, metadata = {}) => {
  woopra.track(actionType, metadata);
}