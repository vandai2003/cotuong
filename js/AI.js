var AI = AI || {};
// khởi tạo trí tuệ nhân tạo
AI.init = function (pace)
{
  var bill = AI.historyBill || com.gambit; // Mở thư viện
  if (bill.length) {
    var len = pace.length;
    var arr = [];

    for (var i = 0; i < bill.length; i++) {
      if (bill[i].slice(0, len) == pace) {
        arr.push(bill[i]);
      }
    }
    if (arr.length) {
      var inx = Math.floor(Math.random() * arr.length);
      AI.historyBill = arr;
      return arr[inx].slice(len, len + 4).split("");
    } else {
      AI.historyBill = [];
    }
  }
  AI.treeDepth = play.depth;

  var val = AI.getAlphaBeta(
    -99999,
    99999,
    AI.treeDepth,
    com.arr2Clone(play.map),
    play.my
  );

  if (val && val.value != -8888) {
    var man = play.mans[val.key];
    return [man.x, man.y, val.x, val.y];
  } else {
    return false;
  }
};

// Lấy tất cả các quân trên bảng
AI.getMapAllMan = function (map, my) {
  var mans = [];
  for (var i = 0; i < map.length; i++) {
    for (var n = 0; n < map[i].length; n++) {
      var key = map[i][n];
      if (key && play.mans[key].my == my) {
        play.mans[key].x = n;
        play.mans[key].y = i;
        mans.push(play.mans[key]);
      }
    }
  }
  return mans;
};

// Nhận tất cả các bước di chuyển của quân cờ
AI.getMoves = function (map, my) {
  var manArr = AI.getMapAllMan(map, my);
  var moves = [];
  for (var i = 0; i < manArr.length; i++) {
    var man = manArr[i];
    var val = man.bl(map);

    for (var n = 0; n < val.length; n++) {
      var x = man.x;
      var y = man.y;
      var newX = val[n][0];
      var newY = val[n][1];
      moves.push([x, y, newX, newY, man.key]);
    }
  }
  return moves;
};

// A: giá trị người chơi hiện tại / B: giá trị đối thủ / độ sâu: cấp độ
AI.getAlphaBeta = function (A, B, depth, map, my) {
  if (depth == 0) {
    return { value: AI.evaluate(map, my) }; // chức năng đánh giá tình huống;
  }
  var moves = AI.getMoves(map, my); // Tạo tất cả các lần chạy; // Điều này sẽ tăng hiệu quả sau khi sắp xếp
  for (var i = 0; i < moves.length; i++) {
    // Đi theo con đường này;
    var move = moves[i];
    var key = move[4];
    var oldX = move[0];
    var oldY = move[1];
    var newX = move[2];
    var newY = move[3];
    var clearKey = map[newY][newX] || "";

    map[newY][newX] = key;
    delete map[oldY][oldX];
    play.mans[key].x = newX;
    play.mans[key].y = newY;

    if (clearKey == "j0" || clearKey == "J0") {
      // Bị ăn quân, hoàn tác vụ này;
      play.mans[key].x = oldX;
      play.mans[key].y = oldY;
      map[oldY][oldX] = key;
      delete map[newY][newX];
      if (clearKey) {
        map[newY][newX] = clearKey;
      }

      return { key: key, x: newX, y: newY, value: 8888 };
    } else {
      var val = -AI.getAlphaBeta(-B, -A, depth - 1, map, -my).value;
      // Hoàn tác di chuyển này
      play.mans[key].x = oldX;
      play.mans[key].y = oldY;
      map[oldY][oldX] = key;
      delete map[newY][newX];
      if (clearKey) {
        map[newY][newX] = clearKey;
      }
      if (val >= B) {
        return { key: key, x: newX, y: newY, value: B };
      }
      if (val > A) {
        A = val;
        // Đặt cách tốt nhất để di chuyển;
        if (AI.treeDepth == depth)
          var rootKey = { key: key, x: newX, y: newY, value: A };
      }
    }
  }

  if (AI.treeDepth == depth) {
    // đã trở lại gốc
    if (!rootKey) {
      // AI không có cách tốt nhất để đi, chỉ ra rằng AI đã chết, trả về sai
      return false;
    } else {
      // Đây là cách tốt nhất để đi;
      return rootKey;
    }
  }
  return { key: key, x: newX, y: newY, value: A };
};

//Hàm lượng giá
AI.evaluate = function (map, my) {
  var val = 0;
  for (var i = 0; i < map.length; i++) {
    for (var n = 0; n < map[i].length; n++) {
      var key = map[i][n];
      if (key) {
        val += play.mans[key].value[i][n] * play.mans[key].my;
      }
    }
  }
  return val*my;
};