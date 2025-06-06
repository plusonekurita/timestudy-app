// src/pages/MainPage/index
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./MainPage.css";
import "swiper/css";

import { Swiper, SwiperSlide } from "swiper/react";
import Box from "@mui/material/Box";
import { useState } from "react";

import { useStopwatchContext } from "../../constants/StopwatchProvider ";
import StopwatchCard from "../../components/StopwatchCard";
import MenuItemGrid from "../../components/MenuItemGrid";
import MainMenuTabs from "../../components/MainMenuTabs";
import { menuCategories } from "../../constants/menu";

const MainPage = () => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0); // タブの管理

  // ストップウォッチ関連の状態(カスタムフック)
  const {
    activeItem,
    isRunning,
    elapsedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cloaseTimer,
  } = useStopwatchContext();

  // タブが変更されたときのハンドラ
  const handleChange = (_event, newValue) => {
    setSelectedTab(newValue);
    swiperInstance?.slideTo(newValue);
  };

  // アイコンクリック時のハンドラ
  const handleItemClick = (item) => {
    // 既に動いているタイマーがあれば、ここで記録処理を行う
    if (activeItem) {
      // dispatch(recordTimeAction({ label: activeItem.label, duration: elapsedTime }));
    }
    startTimer(item); // カスタムフックの startTimer関数
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // minHeight: "calc(100vh - 74px)",
        flexGrow: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        pt: 4, //
        overflowX: "hidden", // 横スクロールバーを隠す
      }}
    >
      {/* タブコンポーネント */}
      <MainMenuTabs
        categories={menuCategories}
        selectedTab={selectedTab}
        onChange={handleChange}
      />
      <Swiper
        className="my-swiper"
        style={{ width: "100%", maxWidth: 600 }} // MenuItemGrid と幅を合わせる
        onSwiper={setSwiperInstance} // Swiperインスタンスを取得
        onSlideChange={(swiper) => setSelectedTab(swiper.activeIndex)} // スワイプ時にタブ状態を更新
        initialSlide={selectedTab} // 初期表示スライド
      >
        {menuCategories.map((category, index) => (
          <SwiperSlide key={index}>
            <Box sx={{ pb: activeItem ? 8 : 0 }}>
              <MenuItemGrid
                items={category.items}
                activeItem={activeItem}
                categoryType={category.type}
                onItemClick={handleItemClick}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ストップウォッチカード */}
      {activeItem && (
        <StopwatchCard
          label={activeItem.label}
          icon={activeItem.icon}
          color={activeItem.color}
          elapsedTime={elapsedTime}
          isRunning={isRunning} // 実行状態を渡す
          onClose={cloaseTimer} // 閉じるボタン(保存無し)の処理 (カスタムフック関数)
          onStop={stopTimer} // ストップボタンの処理 (カスタムフック関数)
          onPause={pauseTimer} // 一時停止ボタンの処理 (カスタムフック関数)
          onResume={resumeTimer} // 一時停止から再生ボタンの処理 (カスタムフック関数)
        />
      )}
    </Box>
  );
};

export default MainPage;
