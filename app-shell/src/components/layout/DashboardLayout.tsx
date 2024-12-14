/* eslint-disable react-hooks/exhaustive-deps */
import { AppTopbarRef, LayoutState } from "@app/types";
import { useEventListener, useUnmountEffect } from "primereact/hooks";
import { classNames } from "primereact/utils";
import React, { ReactNode, useContext, useEffect, useRef } from "react";
import AppFooter from "./AppFooter";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import { LayoutContext } from "./context/layoutcontext";
import { APP_CONFIG, APP_LOGO_SRC } from "@app/AppConfig";
import "./styles/layout.scss"


type DashboardLayoutProps = {
	children: ReactNode;
	currentPath: string;
};

const DashboardLayout = ({ children, currentPath }: DashboardLayoutProps) => {
	const { layoutConfig, layoutState, setLayoutState } =
		useContext(LayoutContext);
	const topbarRef = useRef<AppTopbarRef>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] =
		useEventListener({
			type: "click",
			listener: (event) => {
				const isOutsideClicked = !(
					sidebarRef.current?.isSameNode(event.target as Node) ||
					sidebarRef.current?.contains(event.target as Node) ||
					topbarRef.current?.menubutton?.isSameNode(event.target as Node) ||
					topbarRef.current?.menubutton?.contains(event.target as Node)
				);

				if (isOutsideClicked) {
					hideMenu();
				}
			},
		});

	useEffect(() => {
		hideMenu();
		hideProfileMenu();
	}, [currentPath]);

	const [
		bindProfileMenuOutsideClickListener,
		unbindProfileMenuOutsideClickListener,
	] = useEventListener({
		type: "click",
		listener: (event) => {
			const isOutsideClicked = !(
				topbarRef.current?.topbarmenu?.isSameNode(event.target as Node) ||
				topbarRef.current?.topbarmenu?.contains(event.target as Node) ||
				topbarRef.current?.topbarmenubutton?.isSameNode(event.target as Node) ||
				topbarRef.current?.topbarmenubutton?.contains(event.target as Node)
			);

			if (isOutsideClicked) {
				hideProfileMenu();
			}
		},
	});

	const hideMenu = () => {
		setLayoutState((prevLayoutState: LayoutState) => ({
			...prevLayoutState,
			overlayMenuActive: false,
			staticMenuMobileActive: false,
			menuHoverActive: false,
		}));
		unbindMenuOutsideClickListener();
		unblockBodyScroll();
	};

	const hideProfileMenu = () => {
		setLayoutState((prevLayoutState: LayoutState) => ({
			...prevLayoutState,
			profileSidebarVisible: false,
		}));
		unbindProfileMenuOutsideClickListener();
	};

	const blockBodyScroll = (): void => {
		if (document.body.classList) {
			document.body.classList.add("blocked-scroll");
		} else {
			document.body.className += " blocked-scroll";
		}
	};

	const unblockBodyScroll = (): void => {
		if (document.body.classList) {
			document.body.classList.remove("blocked-scroll");
		} else {
			document.body.className = document.body.className.replace(
				new RegExp(
					"(^|\\b)" + "blocked-scroll".split(" ").join("|") + "(\\b|$)",
					"gi"
				),
				" "
			);
		}
	};

	useEffect(() => {
		if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
			bindMenuOutsideClickListener();
		}

		layoutState.staticMenuMobileActive && blockBodyScroll();
	}, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

	useEffect(() => {
		if (layoutState.profileSidebarVisible) {
			bindProfileMenuOutsideClickListener();
		}
	}, [layoutState.profileSidebarVisible]);

	useUnmountEffect(() => {
		unbindMenuOutsideClickListener();
		unbindProfileMenuOutsideClickListener();
	});

	const containerClass = classNames("layout-wrapper", {
		"layout-overlay": layoutConfig.menuMode === "overlay",
		"layout-static": layoutConfig.menuMode === "static",
		"layout-static-inactive":
			layoutState.staticMenuDesktopInactive &&
			layoutConfig.menuMode === "static",
		"layout-overlay-active": layoutState.overlayMenuActive,
		"layout-mobile-active": layoutState.staticMenuMobileActive,
		"p-input-filled": layoutConfig.inputStyle === "filled",
		"p-ripple-disabled": !layoutConfig.ripple,
	});

	return (
		<React.Fragment>
			<div className={containerClass}>
				<AppTopbar ref={topbarRef} />
				<div ref={sidebarRef} className="layout-sidebar bg-slate-50">
					<div className="sidebar-header flex">
						<a href="/" className="layout-topbar-logo">
							<img src={APP_LOGO_SRC} style={{height: "4rem"}} alt="logo" />
						</a>
						<h4>{APP_CONFIG.APP_TITLE_NAME}</h4>
					</div>
					<AppSidebar currentPath={currentPath} />
				</div>
				<div className="layout-main-container">
					<div className="layout-main">{children}</div>
					<AppFooter />
				</div>
				<div className="layout-mask"></div>
			</div>
		</React.Fragment>
	);
};

export default DashboardLayout;
