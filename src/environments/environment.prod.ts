export const environment = {
  production: true,
  mimeType: 'application/x.handbeat',
  backend: {
    host: '127.0.0.1',
    port: 8080,
    uri: '/detect/hands',
    message: {
      num_items: 2,
      num_bytes: 17,
      mask: {
        hand_left: 0x1,
        hand_right: 0x2
      }
    }
  },
  workspace: {
    scrollScale: 0.1,
    scrollRange: [0.1, 3]
  }
};
