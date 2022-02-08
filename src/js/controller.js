import "core-js/stable";

import "regenerator-runtime/runtime";
import { async } from "regenerator-runtime";

import * as model from "./model";
import recipeView from "./views/recipeView";
import searchView from "./views/searchView";
import resultsView from "./views/resultsView";
import PaginationView from "./views/PaginationView";
import bookmarksView from "./views/bookmarksView";
import addRecipeView from "./views/addRecipeView";
import { MODAL_CLOSE_SEC } from "./config";
//part of parcel
//if the data changes it preserves the state from reloading
// if (module.hot) {
//   module.hot.accept();
// }
const recipeContainer = document.querySelector(".recipe");

// const timeout = function (s) {
//   return new Promise(function (_, reject) {
//     setTimeout(function () {
//       reject(new Error(`Request took too long! Timeout after ${s} second`));
//     }, s * 1000);
//   });
// };

// https://forkify-api.herokuapp.com/v2
//////////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();
    //LOADING RECIPES....
    //update results view to mark selected results

    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    await model.loadRecipe(id);

    ///RENDERING RECIPES....

    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
    console.log(error);
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));
    //Render pagination  button;
    PaginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  //Render new  Results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //Render new pagination  button;
  PaginationView.render(model.state.search);
};
const controlServings = function (newServings) {
  //update the recipe servings in state
  model.updateServings(newServings);
  //update the recipe view
  //recipeView.render(model.state.recipe);
  //to re render entire view instead of that we will render only
  //specific attributes and parts of the view
  //it will decrease the load on browser

  recipeView.update(model.state.recipe);
};
const controlAddBookmark = function () {
  //Add and remove A BOOKMARK
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //UPDATE BOOKAMARKS

  recipeView.update(model.state.recipe);
  //RENDER BOOKMARKS
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    //success message
    addRecipeView.renderMessage();

    //Render Bookmark view
    bookmarksView.render(model.state.bookmarks);
    //Render the recipe
    recipeView.render(model.state.recipe);

    //Change ID in url
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.log("*", error);
    addRecipeView.renderError(error.message);
  }

  //Upload new Recipe
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
