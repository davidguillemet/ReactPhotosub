import { NavLink } from "react-router-dom";

const NavLinkTemplate = props => (
  <NavLink
      exact={true}
      to={props.to}
      activeStyle={{
        borderTopWidth: 4
      }}
  >
    {props.label}
  </NavLink>
);

export default NavLinkTemplate;