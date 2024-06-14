export class SurveyList {
  private static instance: SurveyList | undefined;
  private readonly list: { [surveyId: string]: boolean } | null = null;

  private constructor() {
    this.list = {};
  }

  static getInstance(): SurveyList {
    if (!SurveyList.instance) {
      SurveyList.instance = new SurveyList();
    }

    return SurveyList.instance;
  }

  public getIsSurveyRunning = (surveyId: string) => {
    return this.list?.hasOwnProperty(surveyId);
  };

  public setIsSurveyRunning = (surveyId: string, value: boolean) => {
    if (!this.list) {
      return;
    }

    if (value) {
      this.list[surveyId] = true;
    } else {
      if (this.list.hasOwnProperty(surveyId)) {
        delete this.list[surveyId];
      }
    }
  };

  public getSurveyList = () => {
    return this.list || {};
  };
}
