export interface WizardStep {
  load(msg: String): void;
  openDialog(): void;
  placeDevice(): void;
  clean(): void;
  prepareToSend(): void;
  nextStep(step: WizardStep): void;
}
