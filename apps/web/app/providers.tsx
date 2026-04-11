"use client";

import { TrpcProvider } from "app/_trpc/trpc-provider";
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import CacheProvider from "react-inlinesvg/provider";
import { ToastProvider } from "@coss/ui/components/toast";

import { WebPushProvider } from "@calcom/web/modules/notifications/components/WebPushContext";
import { NotificationSoundHandler } from "@calcom/web/components/notification-sound-handler";

import useIsBookingPage from "@lib/hooks/useIsBookingPage";

import { GeoProvider } from "./GeoContext";

function HelpAliveIdentify() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id && (window as any).HelpAlive?.identify) {
      (window as any).HelpAlive.identify({
        userId: String(session.user.id),
        tenantId: "cal-com-test",
        tenantName: "Cal.com",
        displayName: session.user.name,
        email: session.user.email,
        role: session.user.role,
        plan: session.hasValidLicense ? "enterprise" : "free",
        createdAt: session.user.createdDate
          ? Math.floor(new Date(session.user.createdDate).getTime() / 1000)
          : undefined,
      });
    }
  }, [session?.user?.id, session?.user?.name]);

  return null;
}


type ProvidersProps = {
  isEmbed: boolean;
  children: React.ReactNode;
  nonce: string | undefined;
  country: string;
};
export function Providers({ isEmbed, children, country }: ProvidersProps) {
  const isBookingPage = useIsBookingPage();

  return (
    <GeoProvider country={country}>
      <SessionProvider>
        <HelpAliveIdentify />
        <TrpcProvider>
          <ToastProvider position="bottom-center">
            {!isEmbed && !isBookingPage && <NotificationSoundHandler />}
            {/* @ts-expect-error FIXME remove this comment when upgrading typescript to v5 */}
            <CacheProvider>
              <WebPushProvider>{children}</WebPushProvider>
            </CacheProvider>
          </ToastProvider>
        </TrpcProvider>
      </SessionProvider>
    </GeoProvider>
  );
}
