"use client";

import { useState } from "react";
import Link from "next/link";
import type { MenuItem } from "@/lib/validators/content";

interface GlobalHeaderProps {
  menu: MenuItem[];
  brandName: string;
  logoUrl: string;
}

export function GlobalHeader({ menu, brandName, logoUrl }: GlobalHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="slds-container_x-large slds-container_center slds-p-vertical_x-small slds-p-horizontal_medium">
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
          <Link
            href="/"
            className="slds-grid slds-grid_vertical-align-center slds-no-flex"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={`${brandName} — accueil`}
              width={160}
              height={40}
              className="site-header__logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="slds-assistive-text">{brandName}</span>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="slds-grid slds-grid_vertical-align-center slds-show_large"
          >
            {menu.map((item) =>
              item.primary ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="slds-button slds-button_brand slds-m-left_x-small"
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="site-header__nav-link slds-p-horizontal_small slds-p-vertical_xx-small"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="slds-button slds-button_icon slds-p-around_medium slds-hide_large"
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <span className="slds-assistive-text">
              {open ? "Fermer" : "Ouvrir"} le menu
            </span>
            <svg className="slds-button__icon" aria-hidden="true">
              <use
                href={`/assets/slds/icons/utility-sprite/svg/symbols.svg#${open ? "close" : "rows"}`}
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu mobile"
          className="site-header__mobile slds-hide_large"
        >
          <div className="slds-container_x-large slds-container_center slds-p-around_small slds-grid slds-grid_vertical">
            {menu.map((item) =>
              item.primary ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="slds-button slds-button_brand slds-button_stretch slds-m-top_x-small"
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="site-header__nav-link slds-p-around_small slds-m-bottom_xx-small"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
