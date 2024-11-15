URL:https://chengshengzhe.github.io/databaseProject/

每次更新完後，cmd到根目錄輸入npm run build更新build資料夾
使用git bash到根目錄輸入npx gh-pages -d build將gh-pages分支的build更新
網站主要顯示取決於build

"start": "react-app-rewired start", // 啟動伺服器
"build": "react-app-rewired build", // 打包專案
"test": "react-app-rewired test", // 執行測試
"eject": "react-scripts eject", // 公開 Webpack 配置
"predeploy": "npm run build", // 部署前執行 build
"deploy": "gh-pages -d build" // 部署到 GitHub