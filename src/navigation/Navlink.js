import { NavLink } from "react-router";

const NavLinkTemplate = props => (
  <NavLink
      to={props.to}
      end={props.end}
      style={({ isActive }) => ({
        borderTopWidth: isActive ? 4 : undefined
      })}
  >
    {props.label}
  </NavLink>
);

export default NavLinkTemplate;