import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useOutlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DURATION = 200;

const TRANSITION = `opacity ${DURATION}ms ease-out`;

function OutgoingPage({ children, onDone }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start fully visible, no transition
    el.style.transition = "none";
    el.style.opacity = "1";
    el.style.transform = "translateX(0) scale(1)";
    void el.offsetHeight;
    // Next frame: slide up + fade + scale down
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${DURATION}ms ease-out, transform ${DURATION}ms ease-out`;
      el.style.opacity = "0";
      el.style.transform = "translateY(-16px) scale(0.99)";
    });
  }, []);

  return (
    <div
      ref={ref}
      className="p-6 absolute inset-0 pointer-events-none"
      style={{ opacity: 1, transform: "translateY(0) scale(1)" }}
      onTransitionEnd={onDone}
    >
      {children}
    </div>
  );
}

function IncomingPage({ children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    void el.offsetHeight;
    requestAnimationFrame(() => {
      el.style.transition = TRANSITION;
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  const handleTransitionEnd = (e) => {
    // Clear transform entirely after animation — a lingering transform
    // creates a containing block that breaks fixed/overlay positioning
    // (e.g. dnd-kit DragOverlay, portaled dialogs)
    if (e.propertyName === "opacity") {
      e.currentTarget.style.transition = "none";
      e.currentTarget.style.transform = "none";
    }
  };

  return (
    <div
      ref={ref}
      className="p-6"
      style={{ opacity: 0, transform: "translateY(12px)" }}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const scrollRef = useRef(null);
  const outlet = useOutlet();

  const [current, setCurrent] = useState({ path: location.pathname, outlet });
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    if (location.pathname !== current.path) {
      scrollRef.current?.scrollTo({ top: 0 });
      setPrevious({ ...current });
      setCurrent({ path: location.pathname, outlet });
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main ref={scrollRef} className="flex-1 overflow-y-auto relative">
          {/* New page — slides in from right */}
          <IncomingPage key={current.path}>
            {current.outlet}
          </IncomingPage>
          {/* Old page — slides out left, then removed */}
          {previous && (
            <OutgoingPage
              key={previous.path}
              onDone={() => setPrevious(null)}
            >
              {previous.outlet}
            </OutgoingPage>
          )}
        </main>
      </div>
    </div>
  );
}
