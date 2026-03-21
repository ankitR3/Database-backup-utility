export enum MessageType {
    SUBSCRIBE = 'SUBSCRIBE',
    UNSUBSCRIBE = 'UNSUBSCRIBE',
    BACKUP_COMPLETE = 'BACKUP_COMPLETE',
}

export type ClientMessage = 
    | {
        type: MessageType.SUBSCRIBE;
        configId: string;
      }
    | {
        type: MessageType.UNSUBSCRIBE;
        configId: string;        
      };

export type ServerMessage = {
    type: MessageType.BACKUP_COMPLETE;
    configId: string;
};