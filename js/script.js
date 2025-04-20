window.onload = () => {
    // 履歴操作で同一ページ内のアンカー位置にジャンプ
    const WIDTH = 970;
    const TOPPAGE = "index.html";
    window.addEventListener("popstate", (event) => { anchorJump(); });
    anchorJump();

    function anchorJump() {
        // メニューを開いていたら閉じる
        const menu = document.querySelector("#menu");
        if (menu.classList.contains("open")) {
            document.querySelector("#menu_close_button").click();
        }

        // アドレスバー表示のURLから表示先のアンカー位置を特定
        const top = document.querySelector("#top");
        const target = document.querySelector("*[id='" + decodeURI(location.hash.substring(1)) + "']");
        if (top) {
            if (target) {
                // window幅にあわせてヘッダーの高さ分を調整
                let offsetTop = target.offsetTop;

                // アンカーが表内の場合、表・セルのオフセットも足し合わせる
                if (target.offsetParent.tagName.toLowerCase() == "td") {
                    // アンカーの上位にセル、その上位にテーブル
                    offsetTop += target.offsetParent.offsetTop;
                    offsetTop += target.offsetParent.offsetParent.offsetTop;
                }

                if (window.outerWidth > WIDTH) {
                    top.scrollTo(0, offsetTop - 72);
                } else {
                    top.scrollTo(0, offsetTop - 94);
                }
            } else {
                // アンカー指定がない場合はページトップ
                top.scrollTo(0, 0);
            }
        }

    }

    // 目次ツリーの開閉
    const tocList = document.querySelectorAll("#toc .toc_button");
    tocList.forEach((element, _) => {
        element.onclick = () => {
            // ul要素
            const childElement = element.parentElement.nextElementSibling;
            childElement.classList.contains("open") ? childElement.classList.remove("open") : childElement.classList.add("open")

            // ボタン要素
            element.classList.contains("open") ? element.classList.remove("open") : element.classList.add("open")

        }
    });

    // 現在表示中のページ
    const currentPage = getCurrentPageName();

    // 現在表示中のページの目次項目を選択状態にする
    document.querySelectorAll("#toc li").forEach((element) => {
        element.classList.add("close");
    });

    // 現在表示中のページの目次項目までツリーを開く
    openSelectedTocTree(currentPage + decodeURI(location.hash));

    // 同一ページ内のアンカー移動のみの場合
    // ページ遷移が発生しないのでクリックイベントでツリーの選択状態を更新する
    document.querySelectorAll("#toc a").forEach((element) => {
        element.onclick = () => {
            const menu = document.querySelector("#menu");
            if (menu.classList.contains("open")) {
                document.querySelector("#menu_close_button").click();
            }

            const href = element.attributes["href"].value;
            openSelectedTocTree(href);
        };
    });


    // 現在表示中のページの目次項目までツリーを開く
    function openSelectedTocTree(href) {
        // 選択状態を一度解除
        const selectedToc = document.querySelector("#toc a[class*='selected']");
        if (selectedToc) {
            selectedToc.classList.remove("selected");
        }

        // 現在の項目を選択
        if (href == "") {
            href = TOPPAGE;
        }
        let currentToc = document.querySelector(`#toc a[href$='${href}']`);
        if (!currentToc) {
            currentToc = document.querySelector(`#toc a[href$='${currentPage}']`);
            if (!currentToc) {

                return;
            }
        }
        currentToc.classList.add("selected");

        if (currentToc.previousElementSibling && !currentToc.previousElementSibling.classList.contains("open")) {
            currentToc.previousElementSibling.click();
        }

        // 選択項目までのツリーを開く
        let parentElement = currentToc.parentElement;
        while (parentElement) {
            if (parentElement.nodeName.toLowerCase() == "ul") {
                // ul要素に"open"クラスを付与
                parentElement.classList.add("open");

                // ツリー開閉ボタンを開いている状態にする
                if (parentElement.previousElementSibling) {
                    parentElement.previousElementSibling.firstElementChild.classList.add("open");
                }
            }

            // 上位要素へ
            parentElement = parentElement.parentElement;
        }
    }

    // メニューの表示切り替え
    document.querySelector("#menu_button").onclick = () => {
        document.querySelector("#menu").classList.add("open");
        document.querySelector("#contents").classList.add("close");
    }
    document.querySelector("#menu_close_button").onclick = () => {
        document.querySelector("#menu").classList.remove("open");
        document.querySelector("#contents").classList.remove("close");
    }

    // 現在ページのファイル名の取得
    function getCurrentPageName() {
        // URLをスラッシュで分割し、末端をファイル名とする
        // 末端が空（URLがスラッシュで終わっている）のときはトップページ
        const pathNames = location.pathname.split("/");
        const pathName = pathNames[pathNames.length - 1];
        return pathName;
    }

    // 「前へ」「次へ」の差し込み
    insertPageTransition();

    function insertPageTransition() {
        const pageTransitionNode = document.querySelector("#pageTransition");
        if (pageTransitionNode != null) {
            // 領域の確保
            contents.style.paddingBottom = "0";

            // マニュアル内のページ一覧を目次から作成
            let pages = [];
            let links = [];
            document.querySelectorAll("nav#toc a").forEach((element) => {
                // リンク先のページを切り出し
                let href = element.attributes["href"].value;
                let link = element.attributes["href"].value;
                href = href.substring(href.lastIndexOf("/") + 1);
                if (href.includes("#")) {
                    href = href.substring(0, href.indexOf("#"));
                    link = link.substring(0, link.indexOf("#"));
                }

                if (href == "") {
                    href = "./";
                }

                if (!pages.includes(href)) {
                    pages.push(href);
                    links.push(link);
                }
            });

            // 現在位置の特定
            let current = location.href.substring(location.href.lastIndexOf("/") + 1);
            current = current.replace(location.hash, "").replace(location.search, "");
            const currentIndex = pages.indexOf(current) > 0 ? pages.indexOf(current) : 0;

            // 「前へ」「次へ」を表示
            pageTransitionNode.classList.remove("hidden");

            // 前へ
            if (currentIndex > 0) {
                // 表示
                const prev = document.querySelector("#page_prev");
                prev.classList.remove("hidden");

                // 現在位置からひとつ前のリンクを設定
                const prev_a = document.querySelector("#page_prev a");
                const href = links[currentIndex - 1];
                prev_a.attributes.getNamedItem("href").value = href;
            }

            // 次へ
            if (currentIndex < pages.length - 1) {
                // 表示
                const next = document.querySelector("#page_next");
                next.classList.remove("hidden");

                // 現在位置からひとつ後のリンクを設定
                const href = links[currentIndex + 1];
                const next_a = document.querySelector("#page_next a");
                next_a.attributes.getNamedItem("href").value = href;
            }
        }
    }
}