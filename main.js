var maxResults = 15;
var history_search = "";
var s_startIndex = 0;
var s_books = [];
var useri = {
  id: "",
  class: "",
  name: "",
};
var bookList = {};
var req = new XMLHttpRequest();
var students_list = null;

let double_click_count1 = 0;
let double_click_count2 = 0;
let double_click_count3 = 0;

var d = {};

var add_elem_id = "";
var start_date = "2023/11/26";

var timeoutIDs = {
  s: null,
  p: null,
};

req.onreadystatechange = function () {
  if (req.readyState == 4) {
    if (req.status == 200) {
      var data = eval("(" + req.responseText + ")");
      console.log(data);
      if (s_startIndex == 0) {
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
        }
        var i = {
          title: v["title"],
          authors: v["authors"][0],
          description: v["description"],
          imageLink: "",
          pageCount: v["pageCount"],
          publishedDate: v["publishedDate"],
        };
        console.log(i);
        if ("industryIdentifiers" in Object.keys(v) && v["industryIdentifiers"].length > 1)
          i["imageLink"] =
            "https://www.hanmoto.com/bd/img/" +
            v["industryIdentifiers"][1]["identifier"] +
            "_600.jpg";
        s_books.push(i);
        var elem = document.createElement("li");
        elem.setAttribute("id", "s_li_" + c);
        elem.addEventListener("click", s_li1_click, false);
        //elem.addEventListener("touchstart", s_li1_click, false);
        elem.textContent = i["title"] + " | " + i["authors"];
        d["s_list"].appendChild(elem);
        getElements();
        setStatus("s", "検索結果を更新しました");
      }
    }
  } else {
    console.log("通信中...");
  }
};

function setStatus(id, str) {
  d[id + "_status"].innerHTML = str;
  clearTimeout(timeoutIDs[id]);
  timeoutIDs[id] = setTimeout(function () {
    d[id + "_status"].innerHTML = "　";
  }, 3000);
}

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
    double_click_count1 = 0;

    var id = parseInt(e.target.getAttribute("id").replace("s_li_", ""));
    var bool = true;
    var db = firebase.firestore();
    var postRef1 = db.collection("name").doc(useri.id);
    postRef1.get().then((e) => {
      var d2 = e.data();
      if (d2) {
        for (var v in d2) {
          if (d2[v][0] === s_books[id]["title"] && d2[v][1] === s_books[id]["authors"]) {
            addData(v, s_books[id]["title"], s_books[id]["authors"], true, "name", useri["id"]);
            bool = false;
          }
        }
      }
      if (bool)
        addData(
          "book" + Object.keys(bookList).length,
          s_books[id]["title"],
          s_books[id]["authors"],
          true,
          "name",
          useri["id"]
        );
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
    double_click_count2 = 0;
    var id = "book" + e.target.id.replace("s_li2_", "");
    addData(id, bookList[id][0], bookList[id][1], false, "name", useri.id);
  }
}

function p_data_click(e) {
  if (!double_click_count3) {
    // タップの回数を+1
    double_click_count3++;
    // 500ミリ秒以内に2回目のタップがされればダブルタップと判定
    setTimeout(function () {
      double_click_count3 = 0;
    }, 500);

    // ダブルタップ
  } else {
    // 拡大をさせない
    e.preventDefault();
    // 処理を記述
    // 回数をリセット
    double_click_count3 = 0;

    var ind = e.currentTarget.getAttribute("name").split("_")[3];
    var id = e.currentTarget
      .getAttribute("name")
      .replace("page", "data")
      .replace(/_[0-9]*$/, "");

    var db = firebase.firestore();
    var userRef = db.collection("page").doc(useri.id);
    var k = "list";
    userRef.get().then((e) => {
      var d2 = e.data();
      if (d2) {
        if (!Object.keys(d2[k]).includes(id)) d2[k][id] = [];
        d2[k][id].splice(ind, 1);
        userRef.set(d2, { merge: true }).then((e) => {
          getDataList();
          setStatus("p", "カレンダーを更新しました");
        });
      }
    });
  }
}

function s_input_click(e) {
  var elem = d["s_input"];
  if (elem.value.length <= 0) return false;
  console.log(elem.value.split(/\s+/));
  if (elem.value === history_search) {
    s_startIndex += maxResults;
  } else {
    s_startIndex = 0;
    history_search = elem.value;
  }

  search(elem.value.split(/\s+/));
}

function p_input_click(e) {
  d["modal-001__close"].checked = true;
  if (d["p_book_selects"].value.length < 1) {
    return false;
  }
  if (d["p_page_input"] <= 0) {
    return false;
  }
  var str = add_elem_id.split("_");
  str[0] = "2023";
  var t = String(parseInt(str[1]) * 7 + parseInt(str[2]));

  var datas = {
    date: new Date(new Date(start_date).getTime() + t * 86400000).toLocaleDateString("ja-JP"),
    id: parseInt(
      Object.keys(bookList)
        .filter((k) => bookList[k][0] + " | " + bookList[k][1] === d["p_book_selects"].value)[0]
        .replace("book", "")
    ),
    count: parseInt(d["p_page_input"].value),
  };
  var se_d = {
    s: new Date(start_date),
    e: new Date(datas["date"]),
  };
  console.log(se_d);
  var days = (se_d["e"] - se_d["s"]) / 86400000;
  var key = "data_" + Math.floor(days / 7) + "_" + (days % 7);

  addData3(key, datas, "page", useri.id);
}

function d_input_click(e) {
  if (d["d_input_password"].value.length <= 0) {
    d["d_input_alert"].textContent = "パスワードを入力してください。";
    return false;
  }
  if (!isNumAlp(d["d_input_password"].value)) {
    d["d_input_alert"].textContent = "半角英数字のみで入力してください。";
    return false;
  }
  if (d["d_user_name"].textContent.length < 1) {
    d["d_input_alert"].textContent = "クラスと番号を選択してください。";
    return false;
  }

  var v1 = d["d_class_number"].value.replace("年", "").replace("組", "");
  if (v1.length <= 1) v1 = "4" + v1;
  var v2 = ("0" + d["d_user_number"].value.replace("番", "")).slice(-2);
  var hr_num = String(v1 + v2);
  var bool = false;

  var db = firebase.firestore();
  var postRef1 = db.collection("login").doc("password");
  postRef1.get().then((e) => {
    var d2 = e.data();
    if (d2) {
      if (Object.keys(d2).includes(hr_num)) {
        if (d2[hr_num] === d["d_input_password"].value) {
          bool = true;
        } else {
          d["d_input_alert"].textContent = "パスワードが違います。";
        }
      } else {
        addData2(hr_num, d["d_input_password"].value, "login", "password");
        bool = true;
      }
      if (bool) {
        useri["id"] = hr_num;
        useri["name"] = students_list.find((item) => item.number === hr_num)["name"];
        useri["class"] = hr_num.slice(0, 2);

        d["d_input_alert"].textContent = "";
        document.getElementsByClassName("modal-002")[0].style.display = "none";

        setup(2);
      }
    }
  });
}

function hr_number_changed(e) {
  while (true) {
    var v1 = d["d_class_number"].value.replace("年", "").replace("組", "");
    if (v1.length <= 1) v1 = "4" + v1;
    var v2 = ("0" + d["d_user_number"].value.replace("番", "")).slice(-2);
    var hr_num = String(v1 + v2);
    var bool = false;

    for (var i = 0; i < students_list.length; i++) {
      if (students_list[i]["number"] !== hr_num) continue;
      d["d_user_name"].textContent = students_list[i]["name"];
      bool = true;
      break;
    }

    if (!bool) {
      var options = d["d_user_number"].options;
      options[0].selected = true;
    } else {
      break;
    }
  }
}

function search(s) {
  req.open(
    "GET",
    "https://www.googleapis.com/books/v1/volumes?maxResults=" +
      String(maxResults) +
      "&q=" +
      s.join("+") +
      "&startIndex=" +
      s_startIndex,
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

function addData(num, s, s2, s3, c, d) {
  var db = firebase.firestore();
  var userRef = db.collection(c).doc(d);
  num = String(num);
  userRef.set({ [num]: [s, s2, s3] }, { merge: true }).then((e) => {
    getDataList();
    setStatus("s", "ブックマークを更新しました");
  });
}

function addData2(num, s, c, d) {
  var db = firebase.firestore();
  var userRef = db.collection(c).doc(d);
  num = String(num);
  userRef.set({ [num]: s }, { merge: true });
}

function addData3(num, s, c, d) {
  var db = firebase.firestore();
  var userRef = db.collection(c).doc(d);
  var k = "list";
  userRef.get().then((e) => {
    var d2 = e.data();
    if (d2) {
      if (!Object.keys(d2[k]).includes(num)) d2[k][num] = [];
      d2[k][num].push(s);
      console.log(d2);
      userRef.set(d2, { merge: true }).then((e) => {
        getDataList();
        setStatus("p", "カレンダーを更新しました");
      });
    }
  });
}

function getDataList() {
  while (d["s_list2"].firstChild) {
    d["s_list2"].removeChild(d["s_list2"].firstChild);
  }
  var db = firebase.firestore();
  var postRef1 = db.collection("name").doc(useri.id);
  postRef1.get().then((e) => {
    var d2 = e.data();
    if (d2) {
      for (var v in d2) {
        bookList[v] = [d2[v][0], d2[v][1], d2[v][2]];
        var elem = document.createElement("li");
        elem.setAttribute("id", "s_li2_" + v.replace("book", ""));
        elem.addEventListener("click", s_li2_click, false);
        //elem.addEventListener("touchstart", s_li2_click, false);
        elem.textContent = bookList[v][0] + " | " + bookList[v][1];
        //d["s_list2"].appendChild(elem);
        if (bookList[v][2]) {
          d["s_list2"].appendChild(elem);
        }
      }
      setPageSelects(bookList);
    }
  });

  var db2 = firebase.firestore();
  var postRef2 = db2.collection("page").doc(useri.id);
  postRef2.get().then((e) => {
    var d2_2 = e.data();

    if (d2_2) {
      while (d["p_table_view"].firstChild) {
        d["p_table_view"].removeChild(d["p_table_view"].firstChild);
      }
      d["p_table_view"].insertAdjacentHTML(
        "beforeend",
        '<tr style="height: 20px; background-color: khaki"><th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th></tr>'
      );
      var v = "list";
      var keys = Object.keys(d2_2[v]);
      var maxLen = { x: 7, y: 50 };
      var date1 = new Date(start_date);
      for (var dy = 0; dy < maxLen.y; dy++) {
        var elem1 = document.createElement("tr");
        elem1.setAttribute("id", "data_" + dy);
        d["p_table_view"].appendChild(elem1);
        getElements();
        for (var dx = 0; dx < maxLen.x; dx++) {
          var elem2 = document.createElement("td");
          elem2.setAttribute("id", "data_" + dy + "_" + dx);
          d["data_" + dy].appendChild(elem2);
          getElements();
          var elem3 = document.createElement("span");
          elem3.innerHTML = date1.toLocaleDateString("ja-JP");
          elem3.style.fontWeight = "bold";
          date1.setDate(date1.getDate() + 1);
          d["data_" + dy + "_" + dx].appendChild(elem3);
          var elem4 = document.createElement("ul");
          elem4.setAttribute("id", "ul_" + dy + "_" + dx);
          d["data_" + dy + "_" + dx].appendChild(elem4);
          getElements();
          if (keys.includes("data_" + dy + "_" + dx)) {
            for (var a = 0; a < d2_2[v]["data_" + dy + "_" + dx].length; a++) {
              var elem2_2 = document.createElement("li");
              var b_stat = d2_2[v]["data_" + dy + "_" + dx][a];
              var bs_stat = bookList["book" + b_stat["id"]];
              elem2_2.insertAdjacentHTML(
                "beforeend",
                "<span>" +
                  bs_stat[0] +
                  "</span><br><span>" +
                  bs_stat[1] +
                  "</span><br><span>" +
                  b_stat["count"] +
                  "ページまで</span><br>"
              );
              elem2_2.setAttribute("id", "page_" + dy + "_" + dx + "_" + a);
              elem2_2.setAttribute("name", "page_" + dy + "_" + dx + "_" + a);
              elem2_2.addEventListener("click", p_data_click, false);
              d["ul_" + dy + "_" + dx].appendChild(elem2_2);
              getElements();
              for (var s in d["page_" + dy + "_" + dx + "_" + a].children) {
                if (s % 2 == 0) resize("page_" + dy + "_" + dx + "_" + a, s);
              }
            }
          }
          var elem2_3 = document.createElement("a");
          elem2_3.setAttribute("href", "javascript:void(0)");
          elem2_3.setAttribute("onclick", "openPageDialog(this)");
          elem2_3.setAttribute("id", "a_" + dy + "_" + dx);
          elem2_3.textContent = "＋";
          elem2_3.style.color = "orange";
          elem2_3.style.textDecoration = "none";
          d["data_" + dy + "_" + dx].appendChild(elem2_3);
          getElements();
        }
      }
      /*
      for (var v in d2_2) {
        var keys = Object.keys(d2_2[v]);
        var row_count = 0;
        for (var i = 0; i < keys.length; i++) {
          var ind = { x: parseInt(keys[i].split("_")[2]), y: parseInt(keys[i].split("_")[1]) };
          if (ind.y >= row_count) {
            row_count++;
            var elem1 = document.createElement("tr");
            elem1.setAttribute("id", "data_" + ind.y);
            d["p_table_view"].appendChild(elem1);
            getElements();
          }
          var elem2 = document.createElement("td");
          elem2.setAttribute("id", keys[i]);
          var book_stat = bookList["book" + d2_2[v][keys[i]][1]];
          var elem2_2 = document.createElement("button");
          elem2_2.addEventListener("click", openPageDialog, false);

          d["data_" + ind.y].appendChild(elem2);
        }
      }
      */
    } else {
      var data = { list: {} };
      postRef2.set(data, { merge: true }).then((e) => {
        location.reload();
      });
    }
  });
}

function resize(id, s) {
  d[id].children[s].removeAttribute("style");
  console.log(
    d[id].children[s].getBoundingClientRect().height,
    d[id].children[0].getBoundingClientRect().height * 2
  );

  for (
    let size = 60;
    d[id].children[s].getBoundingClientRect().height >
    d[id].children[0].getBoundingClientRect().height * 2;
    size -= 2
  ) {
    d[id].children[s].style.fontSize = size + "px";
  }
}

function openPageDialog(el) {
  add_elem_id = el.getAttribute("id");
  d["modal-001__open"].checked = true;
}

function setPageSelects(bl) {
  while (d["p_book_selects"].firstChild) {
    d["p_book_selects"].removeChild(d["p_book_selects"].firstChild);
  }
  d["p_page_input"].value = 0;
  for (var k of Object.keys(bl)) {
    if (bl[k][2]) {
      var elem = document.createElement("option");
      elem.textContent = bl[k][0] + " | " + bl[k][1];
      d["p_book_selects"].appendChild(elem);
    }
  }
}

function getCSV() {
  var req = new XMLHttpRequest();
  req.open("get", "list.csv", true);
  //req.open("get", "./list.csv", true);
  req.setRequestHeader("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
  req.send(null);

  req.onload = function () {
    students_list = convertCSVtoArray(req.responseText);
    console.log(students_list);
    setup(1);
  };
}

function convertCSVtoArray(str) {
  var result = [];
  var tmp = str.split("\r\n");

  for (var i = 0; i < tmp.length; ++i) {
    result.push({
      number: tmp[i].split(",")[0],
      name: tmp[i].split(",")[1],
      kana: tmp[i].split(",")[2],
    });
  }

  return result;
}

function isNumAlp(str) {
  str = str == null ? "" : str;
  if (str.match(/^[A-Za-z0-9]*$/)) {
    return true;
  } else {
    return false;
  }
}

function setDialog() {
  var hist1 = [];

  for (var i = 0; i < students_list.length; i++) {
    var v = students_list[i];
    if (hist1.includes(v["number"].slice(0, 2))) continue;
    hist1.push(v["number"].slice(0, 2));

    var v1 = v["number"].slice(0, 2).split("");
    var elem1 = document.createElement("option");
    elem1.textContent = "";
    if (v1[0] == 4) {
      elem1.textContent += v1[1] + "組";
    } else {
      elem1.textContent += v1[0] + "年" + v1[1] + "組";
    }
    d["d_class_number"].appendChild(elem1);
    d["d_class_number"].addEventListener("change", hr_number_changed, false);
  }
  var hist2 = [];
  for (var i = 0; i < students_list.length; i++) {
    var v = students_list[i];
    if (hist2.includes(v["number"].slice(-2))) continue;
    hist2.push(v["number"].slice(-2));

    var v2 = v["number"].slice(-2);
    var elem2 = document.createElement("option");
    elem2.textContent = v2 + "番";
    d["d_user_number"].appendChild(elem2);
    d["d_user_number"].addEventListener("change", hr_number_changed, false);
  }
}

function setup(i) {
  if (i <= 0) {
    getElements();
    getCSV();
    return;
  }
  if (i <= 1) {
    d["d_button"].addEventListener("click", d_input_click, false);
    setDialog();
    return;
  }

  d["tab_parent"].style.visibility = "visible";

  d["s_button"].addEventListener("click", s_input_click, false);
  d["p_button"].addEventListener("click", p_input_click, false);
  //d["s_more_button"].addEventListener("click", s_input_click, false);
  getDataList();
}

function setup2() {}

setup(0);
