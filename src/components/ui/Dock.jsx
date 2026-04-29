import { motion } from "framer-motion";
import { createElement, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside.js";
import { cn } from "../../lib/utils";

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const MotionButton = motion.button;
const MotionDiv = motion.div;

function DockIconButton({ icon: Icon, label, onClick, active, hasMenu, isOpen }) {
  return (
    <MotionButton
      aria-expanded={hasMenu ? isOpen : undefined}
      aria-label={label}
      className={cn("dock-icon-button", active && "active")}
      onClick={onClick}
      title={label}
      type="button"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {createElement(Icon, { size: 20, strokeWidth: 1.8 })}
      <span className="dock-item-label">{label}</span>
      <span className="dock-tooltip">{label}</span>
    </MotionButton>
  );
}

export function Dock({ items, className }) {
  const [openMenu, setOpenMenu] = useState("");
  const dockRef = useRef(null);

  useClickOutside(dockRef, () => setOpenMenu(""), Boolean(openMenu));

  function handleItemClick(item) {
    if (item.children?.length) {
      setOpenMenu((current) => (current === item.label ? "" : item.label));
      return;
    }

    setOpenMenu("");
    item.onClick?.();
  }

  function handleMenuItemClick(item) {
    setOpenMenu("");
    item.onClick?.();
  }

  return (
    <div className={cn("mobile-dock-shell", className)}>
      <MotionDiv
        animate="animate"
        className="mobile-dock"
        initial="initial"
        ref={dockRef}
        variants={floatingAnimation}
      >
        {items.map((item) => {
          const isOpen = openMenu === item.label;
          return (
            <div className="dock-item-wrap" key={item.label}>
              {item.children?.length && isOpen && (
                <div className="dock-more-panel" role="menu">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <button
                        className={cn("dock-more-item", child.active && "active")}
                        key={child.label}
                        onClick={() => handleMenuItemClick(child)}
                        role="menuitem"
                        type="button"
                      >
                        {createElement(ChildIcon, { size: 17, strokeWidth: 1.8 })}
                        <span>{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <DockIconButton
                active={item.active || isOpen}
                hasMenu={Boolean(item.children?.length)}
                icon={item.icon}
                isOpen={isOpen}
                label={item.label}
                onClick={() => handleItemClick(item)}
              />
            </div>
          );
        })}
      </MotionDiv>
    </div>
  );
}
