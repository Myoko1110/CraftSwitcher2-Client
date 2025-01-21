export class ExtensionOperationEvent {
  public extension: string;

  constructor({ extension }: ExtensionOperationEventInput) {
    this.extension = extension;
  }
}

export type ExtensionOperationEventInput = {
  extension: string;
};
