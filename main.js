var maxResults = 15;
var history_search = "";
var s_startIndex = 0;
var s_books = [];
var useri = {
  id: "201514281",
  name: "八木睦月",
};
var bookList = {};
var req = new XMLHttpRequest();

let double_click_count1 = 0;
let double_click_count2 = 0;

var d = {};

req.onreadystatechange = function () {
  if (req.readyState == 4) {
    if (req.status == 200) {
      var data = eval("(" + req.responseText + ")");
      console.log(data);
      if(s_startIndex == 0) {
        s_books = [];
        while (d["s_list"].firstChild) {
          d["s_list"].removeChild(d["s_list"].firstChild);
        }
      }
      for (var c = 0; c < maxResults; c++) {
        var v = data["items"][c]["volumeInfo"];
        if ("language" in Object.keys(v) && v["language"] !== "ja") {
          s_books.push(null);
          continue;
        };
        var i = {
          title: v["title"],
          authors: v["authors"][0],
          description: v["description"],
          imageLink: "",
          pageCount: v["pageCount"],
          publishedDate: v["publishedDate"],
        };
        console.log(i);
        if ("industryIdentifiers" in Object.keys(v) &&v["industryIdentifiers"].length > 1)
          i["imageLink"] =
            "https://www.hanmoto.com/bd/img/" +
            v["industryIdentifiers"][1]["identifier"] +
            "_600.jpg";
        s_books.push(i);
        var elem = document.createElement("li");
        elem.setAttribute("id", "s_li_" + c);
        elem.addEventListener("click", s_li1_click, false);
        //elem.addEventListener("touchstart", s_li1_click, false);
        elem.textContent = i["title"] + "  |  " + i["authors"];
        d["s_list"].appendChild(elem);
        getElements();
      }
    }
  } else {
    console.log("通信中...");
  }
};

function s_li1_click(e) {
  if (!double_click_count1) {
    // タップの回数を+1
    double_click_count1++;
    // 500ミリ秒以内に2回目のタップがされればダブルタップと判定
    setTimeout(function () {
      double_click_count1 = 0;
    }, 500);

  // ダブルタップ
  } else {
    // 拡大をさせない
    e.preventDefault();
    // 処理を記述
    // 回数をリセット
    double_click_count1 = 0
    
    var id = parseInt(e.target.getAttribute("id").replace("s_li_",""));
    var bool = true;
    var db = firebase.firestore();
    var postRef1 = db.collection("name").doc(useri.id);
    postRef1.get().then(e => {
      var d2 = e.data();
      if(d2) {
        for(var v in d2) {
          if(d2[v][0] === s_books[id]["title"]&&d2[v][1] === s_books[id]["authors"]) {
            addData(v,s_books[id]["title"],s_books[id]["authors"],true,"name",useri["id"]);
            bool = false;
          };
        }
      }
      if(bool) addData("book"+Object.keys(bookList).length,s_books[id]["title"],s_books[id]["authors"],true,"name",useri["id"]);
      getDataList();
    });
  }
}

function s_li2_click(e) {
  if (!double_click_count2) {
    // タップの回数を+1
    double_click_count2++;
    // 500ミリ秒以内に2回目のタップがされればダブルタップと判定
    setTimeout(function () {
      double_click_count2 = 0;
    }, 500);

  // ダブルタップ
  } else {
    // 拡大をさせない
    e.preventDefault();
    // 処理を記述
    // 回数をリセット
    double_click_count2 = 0
    var id = "book"+e.target.id.replace("s_li2_","");
    alert("削除しました。");
    addData(id,bookList[id][0],bookList[id][1],false,"name",useri.id);
    getDataList();
  }
}

function s_input_click(e) {
  var elem = d["s_input"];
  if (elem.value.length <= 0) return false;
  console.log(elem.value.split(/\s+/));
  if(elem.value === history_search) {
    s_startIndex+=maxResults;
  }else {
    s_startIndex = 0;
    history_search = elem.value
  }
  
  search(elem.value.split(/\s+/));
}

// "https://www.hanmoto.com/bd/img/----_600.jpg

function search(s) {
  req.open(
    "GET",
    "https://www.googleapis.com/books/v1/volumes?maxResults=" +
      String(maxResults) +
      "&q=" +
      s.join("+")+"&startIndex="+s_startIndex,
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

function addData(num,s,s2,s3,c,d) {
  var db = firebase.firestore();
  var userRef = db.collection(c).doc(d);
  num = String(num);
  userRef.set({[num]: [s,s2,s3]}, { merge: true });
}

function getDataList() {
  while (d["s_list2"].firstChild) {
    d["s_list2"].removeChild(d["s_list2"].firstChild);
  }
  var db = firebase.firestore();
  var postRef1 = db.collection("name").doc(useri.id);
  postRef1.get().then(e => {
    var d2 = e.data();
    if(d2) {
      for(var v in d2) {
        bookList[v] = [d2[v][0],d2[v][1],d2[v][2]];
        var elem = document.createElement("li");
        elem.setAttribute("id", "s_li2_" + v.replace("book",""));
        elem.addEventListener("click", s_li2_click, false);
        //elem.addEventListener("touchstart", s_li2_click, false);
        elem.textContent = bookList[v][0] + "  |  " + bookList[v][1];
        //d["s_list2"].appendChild(elem);
        if(bookList[v][2]) {
          d["s_list2"].appendChild(elem);
        }
      }
    }
  });
}

function setup() {
  getElements();
  d["s_button"].addEventListener("click", s_input_click, false);
  //d["s_more_button"].addEventListener("click", s_input_click, false);
  getDataList();
}

setup();
