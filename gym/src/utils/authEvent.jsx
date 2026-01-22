// centralize utility (you already have an event in some places)
export const openAuthModal = (view = 'login') => {
  document.dispatchEvent(new CustomEvent('openAuthModal', { detail: { view } }));
};

// usage:
openAuthModal('login');
