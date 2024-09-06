// global.d.ts
declare namespace NodeJS {
    interface Global {
      Channel: import('../src/common/Statics').Channels;
      attachment: import('../src/common/AttachmentManager').AttachmentManager
    }
  }
  