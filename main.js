var maxResults = 10;
var req = new XMLHttpRequest();

var d = {};

req.onreadystatechange = function () {
  if (req.readyState == 4) {
    if (req.status == 200) {
      var data = eval("(" + req.responseText + ")");
      console.log(data);
      while (d["s_list"].firstChild) {
        d["s_list"].removeChild(d["s_list"].firstChild);
      }
      for (var c = 0; c < maxResults; c++) {
        var v = data["items"][c]["volumeInfo"];
        if ("language" in Object.keys(v) && v["language"] !== "ja") continue;
        var i = {
          title: v["title"],
          authors: v["authors"][0],
          description: v["description"],
          imageLink: "",
          pageCount: v["pageCount"],
          publishedDate: v["publishedDate"],
        };
        console.log(i);
        if (v["industryIdentifiers"].length > 1)
          i["imageLink"] =
            "https://www.hanmoto.com/bd/img/" +
            v["industryIdentifiers"][1]["identifier"] +
            "_600.jpg";
        var elem = document.createElement("li");
        elem.setAttribute("id", "s_li_" + c);
        elem.addEventListener("click", s_li1_click, false);
        elem.textContent = i["title"] + "  |  " + i["authors"];
        d["s_list"].append(elem);
        getElements();
      }
    }
  } else {
    console.log("通信中...");
  }
};

function s_li1_click(e) {}

function s_input_click(e) {
  var elem = d["s_input"];
  if (elem.value.length <= 0) return false;
  console.log(elem.value.split(/\s+/));
  search(elem.value.split(/\s+/));
}

// "https://www.hanmoto.com/bd/img/----_600.jpg

function search(s) {
  req.open(
    "GET",
    "https://www.googleapis.com/books/v1/volumes?maxResults=" +
      String(maxResults) +
      "&q=" +
      s.join("+"),
    true
  );
  req.setRequestHeader("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
  req.send(null);
}

function getElements() {
  var elem = Array.prototype.slice.call(document.body.querySelectorAll("*")).filter((d) => d.id);
  //id名を取得する
  var idList = elem.map((d) => d.id);

  for (var i in idList) {
    addElement(idList[i]);
  }
}

function addElement(id) {
  d[id] = document.getElementById(id);
}

function setup() {
  getElements();
  d["s_button"].addEventListener("click", s_input_click, false);
}

setup();
