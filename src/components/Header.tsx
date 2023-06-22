import Link from "next/link";
import styles from "styles/Home.module.css";

export const Header = () => {
	return (
		<div className={styles.header}>
			<div className={styles.headerLogo}>
				<Link href="/">
					<p>Ideas Dao</p>
				</Link>
			</div>
			<div className={styles.headerContent}>
				<Link href="/">
					<p className={styles.headerText}>Home</p>
				</Link>
				<Link href="/ideas">
					<p className={styles.headerText}>Ideas</p>
				</Link>
			</div>
		</div>
	);
};
