export const openAuthModal = (view = 'login') => {
  console.log(`Dispatching openAuthModal event with view: ${view}`);
  const event = new CustomEvent('openAuthModal', { detail: { view } });
  document.dispatchEvent(event);
};
