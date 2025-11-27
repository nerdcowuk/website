import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
	title: "NerdCow Headless",
	description: "Big damage website lets goooo.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<div id="page">
					{/* Header will come here like navigation, announcements, etc */}
					<main id="content">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
