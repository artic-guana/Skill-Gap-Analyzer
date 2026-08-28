import { Eye, Sparkles } from "lucide-react";

import visionLogo from "../assets/vision.png";

const Footer = () => (
	<footer className="site-footer">
		<div className="site-footer-inner">
			<div className="site-footer-brand">
				<img src={visionLogo} alt="Team Vision"/>

				<div>
					<p className="eyebrow">SkillPath</p>
					<strong>Made by Team Vision</strong>
				</div>
			</div>

			<div className="site-footer-note">
				<Sparkles size={20} />
				<span>Build your next direction with intention.</span>
			</div>

			<div className="site-footer-mark" aria-hidden="true">
				<Eye size={16} />
				<span>VISION</span>
			</div>
		</div>
	</footer>
);

export default Footer;
