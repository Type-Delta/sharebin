import { repo } from './database/dataController';
import config from './config';
import { sendConsoleOutput } from './utilities';

export function initScheduledTasks() {
   setInterval(async () => {
      try {
         await clearExpiredEditors();
      }
      catch (err) {
         sendConsoleOutput(`Error clearing expired editors: ${String(err)}`, 'error', 'Task');
      }
   }, config.globalScheduleTaskIntervalM * 60 * 1000);

   // Initial run
   clearExpiredEditors().catch(err => {
      sendConsoleOutput(`Error clearing expired editors: ${err}`, 'error', 'Task');
   });
}


async function clearExpiredEditors() {
   sendConsoleOutput('Running scheduled task: Clear Expired Editors', 'debug', 'Task');
   const editorTTL = config.editorTTLDays * 24 * 60 * 60 * 1000;
   const now = Date.now();

   const { deletedCount } = await repo.editors.deleteMany({
      where: {
         lastModified: { $lt: new Date(now - editorTTL) }
      }
   });

   if (!deletedCount) {
      sendConsoleOutput('No expired editors to clear.', 'debug', 'Task');
      return;
   }
   sendConsoleOutput(`Cleared ${deletedCount} expired editors.`, 'normal', 'Task');
}
