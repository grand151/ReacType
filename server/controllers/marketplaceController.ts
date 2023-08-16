import { MarketplaceController } from '../interfaces';
import { Projects } from '../models/reactypeModels';

// array of objects, objects inside
type Projects = { project: {} }[];

const marketplaceController: MarketplaceController = {
  /**
   * Middleware function that finds and returns all published projects from the database
   * @return sends the entire project document to frontend
   */
  getPublishedProjects: (req, res, next) => {
    Projects.find({ published: true }, (err, projects) => {//removed the typing for now for projects: since its the mongodb doc
      if (err) {
        return next({
          log: `Error in marketplaceController.getPublishedProjects: ${err}`,
          message: {
            err: 'Error in marketplaceController.getPublishedProjects, check server logs for details'
          }
        });
      }
      // returns the entire project document, including the id
      res.locals.publishedProjects = projects;
      return next();
    });
  },

  /**
   * 
   * Middleware function that publishes (and saves) a project to the database
   * @return sends the updated project to the frontend
   */
  publishProject: (req, res, next) => {
    const { _id, project, comments, userId, username, name } = req.body;
    const createdAt = Date.now();
   
    if (userId === req.cookies.ssid) {
      Projects.findOneAndUpdate(
        // looks in projects collection for project by Mongo id
        { _id },
        // update or insert the project
        { project, createdAt, published: true, comments, name, userId, username },
        // Options:
        // upsert: true - if none found, inserts new project, otherwise updates it
        // new: true - returns updated document not the original one
        { upsert: true, new: true },
        (err, result) => {
          if (err) {
            return next({
              log: `Error in marketplaceController.publishProject: ${err}`,
              message: {
                err: 'Error in marketplaceController.publishProject, check server logs for details'
              }
            });
          }
          res.locals.publishedProject = result;
          return next();
        }
      );
    }
    // we should not expect a user to be able to access another user's id, but included error handling for unexpected errors
    return next({
      log: 'Error in marketplaceController.publishProject', 
      message: {
        err: 'Error in marketplaceController.publishProject, check server logs for details'
      }
    })
  },

  /**
   * 
   * Middleware function that marks a project as unpublished in the database
   * @return sends the updated project to the frontend
   */
  unpublishProject: (req, res, next) => {
    // pull project name and userId from req.body
    const { _id, userId } = req.body;
    //check if req.cookies.ssid matches userId
    
    if (userId === req.cookies.ssid) {
      Projects.findOneAndUpdate({ _id }, {published: false}, { new: true }, (err, result) => {
        if (err) {
          return next({
            log: `Error in marketplaceController.unpublishProject: ${err}`,
            message: {
              err: 'Error in marketplaceController.unpublishProject, check server logs for details'
            }
          });
        }
        res.locals.unpublishedProject = result;
        return next();
      });
    }
    // we should not expect a user to be able to access another user's id, but included error handling for unexpected errors
    return next({
      log: `Error in marketplaceController.unpublishProject`,
      message: {
        err: 'Error in marketplaceController.unpublishProject, userId of project does not match cookies.ssid'
      }
    })
  }
};
export default marketplaceController;
