const moreLessBtn = document.querySelector(".btn.toggle")

moreLessBtn.addEventListener("click", (e) => {
	console.log(e);

    var elem = event.target.innerText
    if (elem == "More...") {
      console.log("more")
      //Stuff to do when btn is in the read more state
      event.target.innerText = "Less...";
      document.querySelector(".more-less").dataset.id = "more";
			//"more");
			//document.querySelector(".more-less").classList.add("more");
    }
     else {
      event.target.innerText = "More...";
      document.querySelector(".more-less").dataset.id = "less";
    }

  });
