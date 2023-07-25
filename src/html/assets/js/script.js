function displayContent(eleId) {
  let eleDashboard = document.getElementById("dashboard");
  let eleTestList = document.getElementById("test-list");

  if (eleId === "dashboard") {
    if (eleDashboard.classList.contains("hide")) {
      eleDashboard.classList.remove("hide");    
    }
    if (!eleTestList.classList.contains("hide")) {
      eleTestList.classList.add("hide");    
    }
  } else if (eleId === "test-list") {
    if (eleTestList.classList.contains("hide")) {
      eleTestList.classList.remove("hide");    
    }
    if (!eleDashboard.classList.contains("hide")) {
      eleDashboard.classList.add("hide");    
    }
  }
}

function showHideScroll(action) {
  let element = document.getElementById("body-content");

  if (action === "show") {
    if (element.classList.contains("hide-scroll")) {
      element.classList.remove("hide-scroll");    
    }
  } else if (action === "hide") {
    if (!element.classList.contains("hide-scroll")) {
      element.classList.add("hide-scroll");    
    }
  }
}


/** LOADER **/
function hideLoader() {
  document.getElementById("loading").style.visibility = "visibility";
  document.getElementById("loading").style.opacity = "0";
  document.getElementById("loading").style.transition = "all .3s linear";
  document.getElementById("loading").style.zIndex = "0";
  setTimeout(function () {
    document.getElementById("loading").style.display = "none";
  }, 1800);
}
if (window.addEventListener) {
  window.addEventListener("load", hideLoader);
} else if (window.attachEvent) {
  window.attachEvent("onload", hideLoader);
} else {
  window.onload = hideLoader;
}