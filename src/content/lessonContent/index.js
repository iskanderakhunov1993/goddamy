import { internshipStart } from "./internshipStart.js";
import { teamMethods } from "./teamMethods.js";
import { goFoundations } from "./goFoundations.js";
import { taskTracker } from "./taskTracker.js";
import { sprintBookmarksApi } from "./sprintBookmarksApi.js";

export const lessonContent = {
  ...internshipStart,
  ...teamMethods,
  ...goFoundations,
  ...taskTracker,
  ...sprintBookmarksApi,
};
