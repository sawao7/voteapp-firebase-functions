import Link from "next/link";
import styles from "../../styles/Home.module.css";

export const Header = () => {
    return (
		<div className={styles.header}>
			<div className={styles.headerLogo}>
				<p>Idea Dao</p>
			</div>
			<div className={styles.headerContent}>
				<Link href="/">
					<p className={styles.headerText}>Home</p>
				</Link>
				{/* <Link href="/about">
					<p className={styles.headerText}>About</p>
				</Link> */}
				<Link href="/ideas">
					<p className={styles.headerText}>Ideas</p>
                </Link>
                {/* <Link href="/vote">
                    <p className={styles.headerText}>Vote</p>
                </Link> */}
            </div>
		</div>
	);
}
