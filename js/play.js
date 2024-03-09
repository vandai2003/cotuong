var play = play || {};
// var m = null; // Phút
// var s = null; // Giây
// var timeout = null; // Timeout

play.init = function () {
  play.my = 1; // quân đỏ
  play.map = com.arr2Clone(com.initMap); // Khởi tạo bảng
  play.nowManKey = false;
  play.pace = []; // Ghi lại từng bước đi
  play.isPlay = true; // Check để bắt đầu chơi
  play.mans = com.mans;
  play.bylaw = com.bylaw;
  play.show = com.show;
  play.showPane = com.showPane;
  play.depth = play.depth || 3; // Độ sâu tìm kiếm
  play.isFoul = false; // Phạm luật
  play.m=null;
  play.s=null;
  play.timeout=null;

  com.pane.isShow = false; // Ẩn hộp

  // Khởi tạo quân cờ
  for (var i = 0; i < play.map.length; i++) {
    for (var n = 0; n < play.map[i].length; n++) {
      var key = play.map[i][n];
      if (key) {
        com.mans[key].x = n;
        com.mans[key].y = i;
        com.mans[key].isShow = true;
      }
    }
  }

  play.show();

  //Sự kiện nhấp chuột
  com.canvas.addEventListener("click", play.clickCanvas);
  //Nút undo
  com.get("regretBn").addEventListener("click", function (e) {
    play.regret();
  });
};

// Undo
play.regret = function () {
  var map = com.arr2Clone(com.initMap);
  // Khởi tạo tất cả các phần
  for (var i = 0; i < map.length; i++) {
    for (var n = 0; n < map[i].length; n++) {
      var key = map[i][n];
      if (key) {
        com.mans[key].x = n;
        com.mans[key].y = i;
        com.mans[key].isShow = true;
      }
    }
  }
  var pace = play.pace;
  pace.pop();
  pace.pop();
  for (var i = 0; i < pace.length; i++) {
    var p = pace[i].split("");
    var x = parseInt(p[0], 10);
    var y = parseInt(p[1], 10);
    var newX = parseInt(p[2], 10);
    var newY = parseInt(p[3], 10);
    var key = map[y][x];

    var cMan = map[newY][newX];
    if (cMan) com.mans[map[newY][newX]].isShow = false;
    com.mans[key].x = newX;
    com.mans[key].y = newY;
    map[newY][newX] = key;
    delete map[y][x];
    if (i == pace.length - 1) {
      com.showPane(newX, newY, x, y);
    }
  }
  play.map = map;
  play.my = 1;
  play.isPlay = true;
  com.show();
};

// Bấm vào bàn cờ
play.clickCanvas = function (e) {
  if (!play.isPlay) return false;
  var key = play.getClickMan(e);
  var point = play.getClickPoint(e);

  var x = point.x;
  var y = point.y;

  if (key) {
    play.clickMan(key, x, y);
  } else {
    play.clickPoint(x, y);
  }
  play.isFoul = play.checkFoul(); // Kiểm tra xem nó có lâu không
};
// Nhấp vào quân cờ,hai trường hợp, chọn hoặc ăn quân
play.clickMan = function (key, x, y) {
  var man = com.mans[key];
  //ăn quân
  if (
    play.nowManKey &&
    play.nowManKey != key &&
    man.my != com.mans[play.nowManKey].my
  ) {
    //manCho các miếng được ăn
    if (play.indexOfPs(com.mans[play.nowManKey].ps, [x, y])) {
      man.isShow = false;
      var pace = com.mans[play.nowManKey].x + "" + com.mans[play.nowManKey].y;
      delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
      play.map[y][x] = play.nowManKey;
      com.showPane(
        com.mans[play.nowManKey].x,
        com.mans[play.nowManKey].y,
        x,
        y
      );
      com.mans[play.nowManKey].x = x;
      com.mans[play.nowManKey].y = y;
      com.mans[play.nowManKey].alpha = 1;

      play.pace.push(pace + x + y);
      play.nowManKey = false;
      com.pane.isShow = false;
      com.dot.dots = [];
      com.show();
      com.get("clickAudio").play();
      setTimeout("play.AIPlay()", 500);
      if (key == "j0") play.showWin(-1);
      if (key == "J0") play.showWin(1);
    }
  } else {
    if (man.my === 1) {
      if (com.mans[play.nowManKey]) com.mans[play.nowManKey].alpha = 1;
      man.alpha = 0.6;
      com.pane.isShow = false;
      play.nowManKey = key;
      com.mans[key].ps = com.mans[key].bl(); // Nhận tất cả các điểm bạn có thể
      com.dot.dots = com.mans[key].ps;
      com.show();
      // com.get("selectAudio").play();
    }
  }
};

// Nhấp vào điểm
play.clickPoint = function (x, y) {
  var key = play.nowManKey;
  var man = com.mans[key];
  if (play.nowManKey) {
    if (play.indexOfPs(com.mans[key].ps, [x, y])) {
      var pace = man.x + "" + man.y;
      delete play.map[man.y][man.x];
      play.map[y][x] = key;
      com.showPane(man.x, man.y, x, y);
      man.x = x;
      man.y = y;
      man.alpha = 1;
      play.pace.push(pace + x + y);
      play.nowManKey = false;
      com.dot.dots = [];
      com.show();
      com.get("clickAudio").play();
      setTimeout("play.AIPlay()", 500);
    }else {
      //alert("Không thể đi theo cách này!")
    }
  }
};
// // Ai di chuyển quân cờ
play.AIPlay = function () {
  play.my = -1;
  var pace = AI.init(play.pace.join(""));
  if (!pace) {
    play.showWin(1);
    return;
  }
  play.pace.push(pace.join(""));
  var key = play.map[pace[1]][pace[0]];
  play.nowManKey = key;

  var key = play.map[pace[3]][pace[2]];
  if (key) {
    play.AIclickMan(key, pace[2], pace[3]);
  } else {
    play.AIclickPoint(pace[2], pace[3]);
  }
  com.get("clickAudio").play();
};

// Kiểm tra nếu lâu sẽ lỗi
play.checkFoul = function () {
  var p = play.pace;
  var len = parseInt(p.length, 10);
  if (len > 11 && p[len - 1] == p[len - 5] && p[len - 5] == p[len - 9]) {
    return p[len - 4].split("");
  }
  return false;
};

play.AIclickMan = function (key, x, y) {
  var man = com.mans[key];

  // ăn quân
  man.isShow = false;
  delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
  play.map[y][x] = play.nowManKey;
  play.showPane(com.mans[play.nowManKey].x, com.mans[play.nowManKey].y, x, y);

  com.mans[play.nowManKey].x = x;
  com.mans[play.nowManKey].y = y;
  play.nowManKey = false;

  com.show();
  if (key == "j0") play.showWin(-1);
  if (key == "J0") play.showWin(1);
};

play.AIclickPoint = function (x, y) {
  var key = play.nowManKey;
  var man = com.mans[key];
  if (play.nowManKey) {
    delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
    play.map[y][x] = key;

    com.showPane(man.x, man.y, x, y);

    man.x = x;
    man.y = y;
    play.nowManKey = false;
  }
  com.show();
};

play.indexOfPs = function (ps, xy) {
  for (var i = 0; i < ps.length; i++) {
    if (ps[i][0] == xy[0] && ps[i][1] == xy[1]) return true;
  }
  return false;
};

// Nhận điểm nhấp
play.getClickPoint = function (e) {
  var domXY = com.getDomXY(com.canvas);
  var x = Math.round((e.pageX - domXY.x - com.pointStartX - 20) / com.spaceX);
  var y = Math.round((e.pageY - domXY.y - com.pointStartY - 20) / com.spaceY);
  return { x: x, y: y };
};

// Lấy tướng
play.getClickMan = function (e) {
  var clickXY = play.getClickPoint(e);
  var x = clickXY.x;
  var y = clickXY.y;
  if (x < 0 || x > 8 || y < 0 || y > 9) return false;
  return play.map[y][x] && play.map[y][x] != "0" ? play.map[y][x] : false;
};

play.start = function () {
  /*LẤY GIÁ TRỊ BAN ĐẦU*/
  if (play.m === null) {
    play.m = com.mm;
    play.s = com.ss;
  }

  /*CHUYỂN ĐỔI DỮ LIỆU*/
  // Nếu số giây = -1 tức là đã chạy ngược hết số giây, lúc này:
  //  - giảm số phút xuống 1 đơn vị
  //  - thiết lập số giây lại 59
  if (play.s === -1) {
    play.m -= 1;
    play.s = 59;
  }

  // Nếu số phút = -1 tức là đã hết giờ, lúc này:
  //  - Dừng chương trình
  if (play.m == -1) {
    clearTimeout(play.timeout);
    com.get("selectAudio").play();
    alert("Đã hết giờ! Bạn đã thua!");
    window.location.reload();
    return false;
  }

  /*BƯỚC 1: HIỂN THỊ ĐỒNG HỒ*/
  document.getElementById("m").innerText = play.m.toString() + " Phút :";
  document.getElementById("s").innerText = play.s.toString() + " Giây";

  /*BƯỚC 1: GIẢM PHÚT XUỐNG 1 GIÂY VÀ GỌI LẠI SAU 1 GIÂY */
  play.timeout = setTimeout(function () {
    play.s--;
    play.start();
  }, 1000);
};

play.showWin = function (my) {
  play.isPlay = false;
  if (my === 1) {
    alert("Xin chúc mừng, bạn đã thắng! ");
    com.get("selectAudio").play();
    window.location.reload();
  } else {
    alert("Thật không may, bạn đã thua!");
    com.get("selectAudio").play();
    window.location.reload();
  }
};
