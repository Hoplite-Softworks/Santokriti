/**
 * Είναι ο controller για τη σελίδα που δημιουργείται με το ./view/tasks.hbs
 *
 * Η tasks αλλάζει τα περιεχόμενά της στέλνοντας αιτήματα HTTP στον εξυπηρετητή.
 *
 */
import { Task as MyTask } from '../model/task.js';
import * as model from '../model/sqlite-async/tg-model-sqlite-async.mjs';

export async function listAllTasksRender(req, res, next) {
   const userId = req.session.loggedUserId;
   try {
      const tasks = await model.getAllTasks(userId);
      res.render('tasks', { tasks: tasks, model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}

export async function addTask(req, res, next) {
   //Κατασκευάζουμε μια νέα εργασία και τη βάζουμε στην βάση:
   const newTask = new MyTask(null, req.query.taskName);
   try {
      const lastInsertId = await model.addTask(newTask, req.session.loggedUserId);
      const allTasks = await model.getAllTasks(req.session.loggedUserId);
      res.render('tasks', { tasks: allTasks, model: process.env.MODEL, session: req.session });
   } catch (error) {
      next(error);
   }
}

export async function toggleTask(req, res, next) {
   try {
      await model.toggleTask(req.params.toggleTaskId, req.session.loggedUserId);
      const allTasks = await model.getAllTasks(req.session.loggedUserId);
      res.render('tasks', { tasks: allTasks, model: process.env.MODEL });
   } catch (error) {
      next(error);
   }
}

export async function removeTask(req, res, next) {
   try {
      model.removeTask(req.params.removeTaskId, req.session.loggedUserId);
      const allTasks = await model.getAllTasks(req.session.loggedUserId);
      res.render('tasks', { tasks: allTasks, model: process.env.MODEL });
   } catch (error) {
      next(error);
   }
}
