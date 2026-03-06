'use client';

import { usePathname } from 'next/navigation';
import Link from './Link';
import React, { useMemo, useCallback } from 'react';

interface ActiveLinkProps {
  children: React.ReactNode;
  activeClassName: string;
  href: string;
  as?: string;
  [key: string]: unknown;
}

export const ActiveLink = ({
  children,
  activeClassName,
  ...props
}: ActiveLinkProps) => {
  const routePathname = usePathname();

  // Derived state using useMemo - avoids useState and infinite loop risk
  const isActive = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const linkPathname = new URL(props.as || props.href, window.location.href)
        .pathname;
      const activePathname = new URL(routePathname, window.location.href)
        .pathname;
      return linkPathname === activePathname;
    } catch {
      return false;
    }
  }, [routePathname, props.as, props.href]);

  // Memoized to prevent unnecessary recreations
  const processChildren = useCallback(
    (children: React.ReactNode): React.ReactNode => {
      if (!children) return children;

      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        const childElement = child as React.ReactElement<{
          className?: string;
        }>;
        const childClassName = childElement.props.className || '';
        const newClassName = isActive
          ? `${childClassName} ${activeClassName}`.trim()
          : childClassName;

        return React.cloneElement(childElement, {
          ...childElement.props,
          className: newClassName || undefined,
        });
      });
    },
    [isActive, activeClassName],
  );

  return (
    <Link {...props} href={props.href}>
      {processChildren(children)}
    </Link>
  );
};

export default ActiveLink;
